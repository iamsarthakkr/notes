# Isolation Levels & Locking

## Why Isolation Matters
Concurrent transactions touching the same rows can interfere with
each other if nothing stops them — one transaction's in-progress
work can leak into another's view of the data. [[03-transactions-acid]]
covers Isolation as one of the four ACID properties; this file is
the deep-dive on what "interference" actually looks like and how
much of it a given isolation level or lock actually prevents.

## The Read Anomalies

### Dirty Read
Reading another transaction's **uncommitted** change.

Example: Transaction A updates a balance but hasn't committed yet.
Transaction B reads that updated value and acts on it. Transaction A
then rolls back. B has now made a decision based on data that never
actually existed in the database.

### Non-Repeatable Read
Re-reading the *same row* twice within one transaction returns a
different value, because another transaction committed a change to
that row in between the two reads.

Example: Transaction A reads a balance of 500, does some
calculation, reads the same balance again before committing, and
gets 400 — because Transaction B updated and committed in between
A's two reads.

### Phantom Read
Re-running the *same query* twice within one transaction returns a
different **set** of rows, because another transaction inserted or
deleted rows matching that query's condition in between.

Example: Transaction A runs `SELECT * FROM orders WHERE status =
'pending'` and gets 10 rows. Before A commits, Transaction B inserts
a new pending order and commits. A runs the exact same query again
and now gets 11 rows — a row appeared that wasn't there a moment ago,
within the same transaction.

## Isolation Levels

### Read Uncommitted
Prevents nothing. Allows dirty reads, non-repeatable reads, and
phantom reads. Essentially unsafe for anything that matters — rarely
used in practice.

### Read Committed
Prevents dirty reads — a transaction only ever sees data that's
already committed. Still allows non-repeatable reads and phantom
reads, since nothing stops another transaction from committing a
change or new row between two reads in this transaction.

This is the default in Postgres and most databases.

### Repeatable Read
Prevents dirty reads and non-repeatable reads — once this
transaction reads a row, that row's value is guaranteed stable for
the rest of the transaction. In the general SQL-standard sense, still
allows phantom reads.

This is MySQL/InnoDB's default — but with a notable quirk: InnoDB's
implementation of Repeatable Read uses **gap locks** (locks on the
space *between* index entries, not just existing rows), which in
practice prevents most phantom reads too. This is a MySQL-specific
strengthening of the standard's guarantee, not something you should
assume applies to Repeatable Read on other databases.

### Serializable
Prevents all three anomalies. Transactions behave as if they ran one
at a time in some sequential order, even though they're actually
running concurrently. Highest cost — enforced either through heavy
locking or conflict-detection/retry overhead (depending on the
engine), since the database has to guarantee an outcome equivalent
to strict serial execution.

## Pessimistic Locking
Lock the row before touching it, so no other transaction can touch
it until this one finishes — assumes conflict is likely enough that
it's cheaper to block upfront than to detect and recover from it later.

`SELECT ... FOR UPDATE` reads a row and takes an exclusive lock on it
in the same statement — any other transaction trying to
`SELECT ... FOR UPDATE` (or update/delete) the same row blocks until
this transaction commits or rolls back.

```sql
BEGIN;
SELECT * FROM inventory WHERE sku = 'ABC123' FOR UPDATE;
-- row is locked here; other FOR UPDATE/UPDATE on this row blocks
UPDATE inventory SET quantity = quantity - 1 WHERE sku = 'ABC123';
COMMIT;
```

**Shared vs exclusive locks**: a shared (read) lock allows other
transactions to also take a shared lock on the same row (multiple
readers), but blocks anyone trying to take an exclusive lock. An
exclusive (write) lock blocks everyone else — no other shared or
exclusive lock can be taken on that row until it's released. `FOR
UPDATE` takes an exclusive lock; a plain read under most isolation
levels takes no lock at all or a shared one, depending on the engine.

**When to use it**: high contention on the same rows where
correctness matters more than raw throughput — seat booking
(two users can't book the same seat), inventory decrement (can't
oversell the last unit). In these cases, letting two transactions
proceed optimistically and resolving the conflict after the fact is
worse than just making the second one wait.

**Cost**: every blocked transaction sits idle waiting for the lock to
release, so throughput drops under contention — the exact rows
everyone wants are the ones now serialized through one transaction at
a time. Pessimistic locking also introduces the risk of **deadlocks**
(two transactions each waiting on a lock the other holds) — covered
in full in the next file.

## The Core Tradeoff
Every choice in this file is the same tension restated: **stricter
correctness always costs concurrency.** A weaker isolation level or
no locking lets more transactions run in parallel but permits more
anomalies; a stronger isolation level or explicit locking closes
those anomalies but makes transactions wait on each other, directly
capping throughput. There's no setting that gives you both for free
— every level up this ladder trades some concurrency for some
additional guarantee.

## Comparison Table

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Relative Cost |
|---|---|---|---|---|
| Read Uncommitted | Allowed | Allowed | Allowed | Lowest |
| Read Committed | Prevented | Allowed | Allowed | Low |
| Repeatable Read | Prevented | Prevented | Allowed (standard) / mostly prevented in MySQL via gap locks | Medium |
| Serializable | Prevented | Prevented | Prevented | Highest |
