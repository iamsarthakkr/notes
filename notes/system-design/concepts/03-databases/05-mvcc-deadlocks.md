# MVCC & Deadlocks

## MVCC (Multi-Version Concurrency Control)
Instead of locking a row for readers, the database keeps multiple
versions of that row and gives each transaction a consistent
snapshot to read from — the version that was already committed when
the transaction started.

Why it exists: it lets reads and writes proceed concurrently without
readers blocking writers or writers blocking readers. This is the
core alternative to pessimistic locking as a way of handling
concurrency — instead of making transactions wait on each other for
reads, give each one its own consistent view of the data.

How it works at a high level: each row version is tagged with the
identity of the transaction that created it (a transaction ID or
timestamp). When a transaction reads a row, it reads the version
that was committed before it started — it ignores any version still
uncommitted, and ignores versions committed *after* it started, even
if those are newer.

**Postgres vs MySQL/InnoDB**: both implement MVCC but differently
under the hood. Postgres keeps old row versions directly in the
table itself (each UPDATE inserts a new row version rather than
overwriting in place), and a background `VACUUM` process reclaims
the space taken by versions no longer visible to any transaction.
InnoDB instead keeps only the latest row version in the table and
uses **undo logs** to reconstruct older versions on demand when a
transaction needs to see a prior snapshot. Different storage
tradeoff, same underlying idea — enough to sound informed if asked,
not something to go deeper on here.

**How this connects to isolation levels** ([[04-isolation-levels-locking]]):
MVCC is the mechanism that makes Read Committed and Repeatable Read
cheap to provide without heavy locking — each transaction just reads
its own appropriate snapshot instead of the database blocking readers
against writers to enforce those guarantees. Isolation levels
describe *what a transaction is allowed to see*; MVCC is *how the
database delivers that* without making reads and writes fight over
locks. What each level actually prevents is already covered in
that file.

### Tradeoff: Write Skew
MVCC removes read-blocking, but it doesn't make concurrent writes
free of correctness problems. Under Repeatable Read / Snapshot
Isolation, **write skew** is still possible: two transactions each
read a shared value, each independently decides — based on that
snapshot — that it's safe to act, and both commit. The combined
effect violates a constraint that neither transaction individually broke.

Example: a rule requires at least one on-call doctor at all times.
Two doctors, A and B, are both currently on-call. Transaction 1 reads
"2 doctors on call" and decides it's safe for Doctor A to go
off-call. Transaction 2, reading the same snapshot concurrently,
decides it's safe for Doctor B to go off-call. Both commit. Now zero
doctors are on-call — a constraint violated by the *combination* of
two transactions that each individually looked safe in isolation.

## Deadlocks
Two or more transactions each hold a lock the other one needs, and
neither can proceed — a circular wait with no way out on its own.

Example: Transaction A locks Row 1, then tries to lock Row 2.
Transaction B has already locked Row 2, and tries to lock Row 1. A is
waiting on a lock B holds; B is waiting on a lock A holds. Both wait
forever unless something intervenes.

**How databases handle it**:
- **Deadlock detection** — the database periodically checks for
  circular wait conditions, picks one transaction as the "victim,"
  kills it, and returns an error to that transaction's client. The
  other transaction proceeds normally.
- **Deadlock prevention** — avoid the circular wait from ever forming
  in the first place, typically via lock ordering.

**Practical fix**: always acquire locks in a consistent order across
the entire codebase — e.g. if a transaction needs to lock two rows,
always lock the lower ID first, regardless of which order the
business logic happens to touch them in. If every transaction locks
in the same order, a circular wait becomes structurally impossible.

**What the application must do**: catch the deadlock exception and
retry the transaction. A deadlock is expected and recoverable — it's
not a bug by itself, given locking is being used at all. The actual
bug is code that doesn't catch and retry, and instead lets the
deadlock surface as an unhandled error to the end user.

## The Connecting Tradeoff
MVCC and deadlocks are the same underlying problem — what happens
when transactions collide — showing up at two different points.
MVCC removes blocking on reads but doesn't eliminate correctness
issues under concurrent writes (write skew, lost updates still
happen). Pessimistic locking removes those write-correctness risks by
making transactions wait for each other — but that waiting is exactly
what creates the possibility of a circular wait, i.e. a deadlock.
Neither approach makes concurrency free; they just move the cost to
a different place — MVCC to occasional write anomalies, locking to
occasional blocked/killed transactions.

## Comparison Table

| | Pessimistic Locking | MVCC |
|---|---|---|
| Blocking behavior | Readers/writers block each other on contended rows | Readers never block writers or vice versa |
| Throughput under contention | Drops — transactions queue on the lock | Stays high — each transaction reads its own snapshot |
| Risk profile | Deadlocks under circular lock acquisition | Write skew / lost updates under concurrent writes to related data |
| Typical use case | High-contention rows needing strict correctness (seat booking, inventory) | General-purpose OLTP workloads where most operations don't conflict |
