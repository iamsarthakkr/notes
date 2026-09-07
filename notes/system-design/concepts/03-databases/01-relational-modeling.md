# Relational Modeling

## Core Concepts
A **table** is a collection of records with the same shape. A
**row** is one record. A **column** defines a field's name and type
for every row in the table. A **schema** is the full definition of
tables, columns, types, and constraints — it's the contract the
database enforces on every write.

What each one determines:
- Table/column design → how data is physically stored and how
  naturally it maps to the things you're modeling
- Schema (types, constraints, keys) → correctness — what data is
  even allowed to exist in the table
- Both together → read/write cost. A wide table with rarely-read
  columns costs every query more bytes off disk; a poorly chosen key
  costs every write an extra index update

A relational database isn't just "tables" — it's structured data +
relationships between tables + constraints enforcing correctness +
a query language to join across them + transactions guaranteeing
multi-step operations are all-or-nothing. Drop any one of those and
you basically have a key-value store with extra steps.

## Relationships

### 1:1 — User → UserProfile
One row in `users` matches exactly one row in `user_profiles`.

Keep together when the data is always read together and small.
Separate into its own table when:
- The extra columns are optional/nullable for most rows (e.g. `bio`,
  `avatar_url`, `date_of_birth`) — splitting keeps the hot `users`
  row small
- The extra columns are rarely read — you don't want every login
  query pulling a big `bio` text field off disk
- Reduces cache pressure — if `users` is cached in Redis/app memory
  for auth checks on every request, keeping it lean means more rows
  fit in cache

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  avatar_url VARCHAR(500),
  date_of_birth DATE
);
```

### 1:N — User → Orders
One user has many orders; one order belongs to one user. The "many"
side holds the foreign key — `orders.user_id`, not the other way
around, since a user row can't hold a variable number of order IDs.

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  total_cents INT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

### N:M — Student ↔ Course
A student takes many courses; a course has many students. Neither
side can hold the FK directly (would need a variable-length column),
so it requires a **join table** in between.

```sql
CREATE TABLE enrollments (
  student_id BIGINT REFERENCES students(id),
  course_id BIGINT REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);
```

The join table's composite PK `(student_id, course_id)` guarantees a
student can't enroll in the same course twice.

Join tables often stop being "just a link" and become their own
**Relation + metadata** entity — the relationship itself has facts
worth storing:

```sql
CREATE TABLE likes (
  post_id BIGINT REFERENCES posts(id),
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  source VARCHAR(50), -- 'feed', 'explore', 'notification'
  PRIMARY KEY (post_id, user_id)
);
```

Once a join table has its own meaningful columns like this, it's
often worth giving it its own surrogate `id` rather than staying
pinned to the composite PK — see Keys below.

## Keys

**Primary Key (PK)** — uniquely identifies a row. Should be small
(cheap to index, cheap to store in every FK that references it),
stable (never changes after creation), unique, and ideally
meaningless (no business logic encoded in it — see surrogate keys).

**Candidate Key** — any column (or set of columns) that *could*
have been chosen as the PK because it's already unique — e.g. email
or phone number on a `users` table. You pick one as PK; the rest
remain enforceable via `UNIQUE` constraints.

**Composite Key** — a PK made of multiple columns, used when the
relationship itself is naturally identified by the combination (e.g.
`(student_id, course_id)` above — no single column identifies an
enrollment, the pair does).

**Surrogate Key** — an artificial key the system generates
(auto-increment `id`, UUID) with no business meaning. Preferred as
PK in most cases because it never needs to change.

**Foreign Key (FK)** — a column that points to a PK in another
table; this is the mechanism that actually forms a relationship at
the schema level, not just a convention in application code.

**Referential Integrity** — the DB refuses to create a row whose FK
points at a PK that doesn't exist, and (by default) refuses to
delete a referenced row while FKs still point at it. This is
enforced by the database engine itself, not by application code
remembering to check.

### ON DELETE Strategies
What happens to child rows when the referenced parent row is deleted:

| Strategy | Behavior | When to use |
|---|---|---|
| `RESTRICT` (default) | Blocks the delete if any child row still references it | Default choice — force an explicit decision instead of silently cascading damage |
| `CASCADE` | Deletes child rows automatically along with the parent | Child rows have no meaning without the parent (e.g. delete a `post` → delete its `comments`) |
| `SET NULL` | Sets the FK column to `NULL` on child rows | Child row still makes sense standalone (e.g. delete a `category` → product's `category_id` goes null, product still exists) |

```sql
category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE
```

### Natural vs Surrogate Key Tradeoff

| | Natural Key (e.g. email) | Surrogate Key (e.g. auto-increment id) |
|---|---|---|
| Meaning | Carries business meaning | Meaningless — just an identifier |
| Stability | Can change (user changes email) | Never changes |
| Size | Often larger (VARCHAR) | Small, fixed-size (BIGINT) |
| Index/join cost | Higher — string comparisons, bigger index | Lower — integer comparisons |
| Risk | A business-rule change forces a PK change | Immune to business-rule changes |

**Why PK stability matters for scalability**: the PK isn't just a
column — it's threaded through every FK that references it, every
index built on those FKs, every cache key derived from the row, and
every replica/read-model keyed by it. Changing a PK value means
updating all of that in lockstep across a live system. A meaningless
surrogate key never needs to change because it was never tied to a
business fact that could change — that's the entire argument for
preferring it.

## Constraints

Never rely solely on the application layer to enforce a critical
invariant (uniqueness, required fields, valid foreign keys). Two
requests can hit two different app server instances at the exact
same moment — both check "does this email exist?", both see "no",
both insert. The application-layer check-then-act is inherently
racy; only the database can make the check-and-write atomic, because
it holds the lock.

```sql
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
```

Treat DB constraints as the actual source of truth regardless of how
careful the application code is — app-layer validation is a UX
nicety (fail fast, give a friendly error), not a correctness
guarantee.

### UPSERT
An atomic "update if it exists, insert if it doesn't" — the database
handles the concurrency, locking, and uniqueness check internally in
one statement, instead of the application doing a racy
check-then-insert-or-update.

```sql
INSERT INTO inventory (sku, quantity)
VALUES ('ABC123', 10)
ON DUPLICATE KEY UPDATE quantity = quantity + 10;
```

This is safe under concurrent writes to the same `sku` in a way that
a `SELECT` followed by an `INSERT`/`UPDATE` in application code
never is.
