# Relational Modeling — Interview Phrases

## Explaining Relationship Types and When to Use a Join Table
"1:1 and 1:N I model with a plain foreign key — the many side, or
the side with optional data, holds it. N:M I always need a join
table for, since neither side can hold a variable number of foreign
keys directly. Once that join table starts carrying its own columns
— like a `created_at` or `source` on a likes table — I stop thinking
of it as just a link and treat it as its own entity that happens to
sit between two others."

## Why Surrogate Keys Over Natural Keys for Scalability
"I default to a surrogate key — an auto-increment id or UUID —
instead of a natural key like email, because the primary key gets
threaded through every foreign key, index, and cache entry that
references that row. A natural key can change when a business rule
changes — a user updates their email — and now that change has to
propagate everywhere it's referenced. A surrogate key never carries
business meaning, so it never has a reason to change."

## Referential Integrity — Why Enforce at the DB, Not Just the App
"I don't trust application-layer checks alone for things like
uniqueness or valid foreign keys, because a check-then-act at the
app layer is racy — two requests can both check 'does this exist?',
both see no, and both insert. Only the database can make that check
atomic, because it's the one holding the lock. So constraints go on
the schema as the actual source of truth, and app-layer validation
is just there for a fast, friendly error message."

## Choosing an ON DELETE Strategy
"I default to RESTRICT so a delete that would orphan child rows
fails loudly instead of silently cascading damage. I reach for
CASCADE when the child genuinely has no meaning without the parent —
deleting a post should delete its comments. I use SET NULL when the
child is still a valid standalone record without the parent —
deleting a category shouldn't delete the products in it, just clear
their category reference."

## One-Liner
"A relational schema is the correctness layer — tables and columns
decide storage and query cost, but keys and constraints are what
stop the database from ever holding data that shouldn't exist,
including under concurrent writes the application layer can't fully guard against."
