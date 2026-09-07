# Normalization & Denormalization

## Normalization
The discipline of structuring tables so each fact is stored in
exactly one place. If a fact can change, there should be exactly one
row that has to be updated — not several copies that can drift out
of sync with each other.

Why it exists — without it you get three classic anomalies:
- **Update anomaly**: the same fact is duplicated across many rows;
  updating it means updating all of them, and missing even one
  leaves the data inconsistent
- **Delete anomaly**: deleting a row accidentally destroys a fact
  that wasn't really about that row (e.g. deleting the last order
  for a department also deletes the only record of that
  department's name)
- **Insert anomaly**: you can't record a fact until an unrelated fact
  also exists (e.g. can't store a new department's name until at
  least one employee is assigned to it)

Normalization is applied in increasing levels ("normal forms"), each
fixing a more subtle version of duplication.

### 1NF — Atomic Values Only
Every column must hold a single, indivisible value — no
comma-separated lists, no arrays packed into a string.

```
-- Bad: violates 1NF
users
| id | phone                |
|----|----------------------|
| 1  | 999,000,777          |  <- multiple values in one cell
```

Fix: split into a separate table (`user_phones`) with one row per
phone number, `user_id` as the FK. Now each cell holds exactly one value.

### 2NF — No Partial Dependency on a Composite Key
Applies to tables with a composite PK. Every non-key column must
depend on the *whole* key, not just part of it.

```
-- Bad: violates 2NF
enrollments
| student_id | course_id | student_name | grade |
PK = (student_id, course_id)
```

`student_name` depends only on `student_id`, not on the full
`(student_id, course_id)` pair — it's duplicated once per course the
student takes. Fix: move `student_name` to the `students` table
where it actually belongs; `enrollments` keeps only columns that
genuinely depend on the full composite key (like `grade`).

### 3NF — No Transitive Dependency Between Non-Key Columns
Every non-key column must depend directly on the PK — not on
another non-key column.

```
-- Bad: violates 3NF
employees
| id | department_id | department_name |
```

`department_name` depends on `department_id`, not directly on `id`
(the employee's PK) — it's a fact about the department, transitively
attached to the employee row. Fix: move `department_name` into a
`departments` table; `employees` keeps only `department_id` as the FK.

### Benefits
- Correctness — each fact has one source, so it can't drift out of
  sync with itself
- Clean writes — updating a fact is a single-row update, not a
  multi-row sweep
- Less duplication — smaller total storage, no redundant copies
- Easier schema evolution — adding/changing a fact touches one table

## Denormalization
The deliberate reintroduction of duplication — copying data across
tables — specifically to make reads faster. It's a read-optimization
technique, not a modeling mistake.

**When to do it**: a specific read path is too slow or too frequent
at the scale you're actually operating at — not preemptively,
"just in case." The default should always be a fully normalized
schema; denormalize only once a real, measured read pattern demands it.

### Common Patterns
- **Snapshot fields** — copy a value at write time instead of
  joining for it at read time:
  ```sql
  ALTER TABLE posts ADD COLUMN username_snapshot VARCHAR(50);
  ALTER TABLE posts ADD COLUMN avatar_snapshot VARCHAR(500);
  ```
  Avoids joining to `users` on every single feed read, at the cost of
  the snapshot going stale if the user later changes their name/avatar.
- **Precomputed counts** — store `followers_count` directly on
  `users` instead of running `COUNT(*)` over the followers table on
  every profile view; update it incrementally on follow/unfollow.
- **Read-optimized schema** — a separate table (e.g. `posts_feed`)
  shaped exactly like the read needs it, fully denormalized, kept in
  sync with the normalized source tables by a background job or
  event stream.
- **Search indexes, reporting dashboards, analytics tables** — these
  routinely flatten data from many normalized tables into one
  wide, duplicated shape, because the read pattern (scan/aggregate)
  is fundamentally different from the normalized OLTP write pattern.

### Tradeoffs
Denormalization trades write simplicity for read speed:
- Writes get more complex — a single logical update (e.g. user
  changes their name) now has to propagate to every place that value
  was duplicated
- Duplication reintroduces the risk normalization removed — copies
  can drift if the sync isn't reliable
- Usually requires background sync jobs, event-driven updates, or
  accepting eventual consistency (snapshot fields going briefly stale)

### Worked Example — Feed Read
Reading a feed needs post content + author's username + author's avatar.

- **Normalized**: `posts` JOIN `users` on every feed read. Correct
  and always up to date, but at high read volume that JOIN runs
  constantly and gets expensive.
- **Denormalized**: `posts` carries `username_snapshot` and
  `avatar_snapshot` directly. Feed read becomes a single-table query
  with no JOIN — much cheaper at scale — at the cost of the snapshot
  not reflecting a later username/avatar change until the next sync.

## Comparison Table

| | Normalized | Denormalized |
|---|---|---|
| Correctness | Single source of truth per fact | Risk of stale/drifted copies |
| Duplication | Minimal | Deliberate, often significant |
| Read speed | Slower — requires JOINs | Fast — single-table reads |
| Write complexity | Simple — one row to update | Complex — must propagate to all copies |
| Use case | OLTP, transactional correctness | High-read-volume paths, feeds, search, analytics |
