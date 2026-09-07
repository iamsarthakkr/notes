# Transactions & ACID

## Transactions
A transaction is a unit of work — a sequence of operations treated
as one indivisible action. Either every operation in it succeeds, or
none of them do; there's no state where only some of them applied.

Why they exist: without a transaction boundary, a failure partway
through a multi-step write leaves the database in a broken,
half-written state — some rows updated, others not, with nothing
tying them back together as "this was supposed to happen as one thing."

### Transaction Boundaries
- `BEGIN` — starts the transaction; every write after this point is
  provisional, not visible to other transactions, and not yet durable
- `COMMIT` — makes all writes since `BEGIN` permanent and visible to
  everyone else, atomically, in one step
- `ROLLBACK` — discards every write since `BEGIN` as if none of it
  happened

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT; -- or ROLLBACK if anything above failed
```

### Spring Boot Tie-In — @Transactional
`@Transactional` wraps a method in a proxy that issues `BEGIN`
before the method runs and `COMMIT`/`ROLLBACK` after, based on
whether the method threw.

Propagation basics:
- `REQUIRED` (default) — joins the caller's existing transaction if
  one is open, otherwise starts a new one
- `REQUIRES_NEW` — always starts a fresh transaction, suspending the
  caller's — used when a piece of work (e.g. an audit log write)
  must commit independently of whatever the caller ends up doing

Classic mistake — **self-invocation**: calling a `@Transactional`
method from another method in the *same class* goes through a direct
Java call, not through the Spring proxy. The annotation is silently
ignored — no transaction is started, and this fails quietly with no
error at all.

## ACID

### Atomicity
All operations in the transaction succeed, or none do.

Without it: a transfer could debit Account A and then fail before
crediting Account B — money vanishes, with no record of where it went.

Example: debit A, credit B. If the credit fails for any reason (bad
account, constraint violation, connection drop), the debit is rolled
back too — both or neither.

### Consistency
The database moves from one valid state to another — every
constraint, foreign key, and invariant declared on the schema still
holds after the transaction, even if it fails partway through.

Without it: a transfer could commit in a state where the sum of both
balances changed — money was created or destroyed rather than moved.

Example: a transfer of 100 from A to B must leave `balance_A +
balance_B` exactly unchanged. If it doesn't, a constraint or the
transaction logic itself is broken.

### Isolation
Concurrent transactions don't see each other's uncommitted changes —
two transfers touching the same account at the same time can't read
or act on each other's half-finished state.

How strictly this is enforced (what a transaction can and can't see
from another in-flight transaction) is a tunable, non-trivial choice
— covered as its own deep-dive in
[[04-isolation-levels-locking]]. Not re-explained here.

### Durability
Once a transaction commits, the change survives a crash immediately
after — it's not sitting only in memory waiting to be lost.

Example: a **write-ahead log (WAL)** — the database writes the
change to an append-only log on disk *before* acknowledging the
commit to the client. If the process crashes right after
acknowledging, the log still has the change and it's replayed on
restart — nothing acknowledged as committed is ever lost.

## Common Mistakes

**Transaction scope too wide** — doing slow, unrelated work (calling
an external API, sending an email) inside a transaction. This holds
DB locks and a connection open for the entire duration of that slow
call, blocking every other transaction waiting on the same rows for
no reason related to the actual data change.

**Transaction scope too narrow** — splitting operations that must be
atomic across multiple separate transactions "to keep things
simple." This reintroduces exactly the partial-write risk
transactions exist to prevent — a crash between the two separate
transactions leaves the system in the same broken half-state as
having no transaction at all.

**Rollback only on exceptions, not business-logic failure** — a
transaction only rolls back automatically on an unchecked exception.
A business-logic failure that's handled as a normal return value
(e.g. an `if (result.isFailure())` branch that doesn't throw) won't
trigger a rollback unless the code explicitly calls for one — a
common source of silent partial commits.

## Project Tie-In — University Management System Approval Workflow
Approving a pending registration does two things: creates a
`Student` (or `Instructor`) row, and updates `User.status` to
`APPROVED`. This is the atomicity example in practice — walking
through what breaks if it isn't one transaction:

- If `User.status` commits first and the `Student` insert fails
  afterward: the system now has an approved user with no `Student`
  record. Any code that assumes "approved user → has a Student row"
  (enrollment, grading, dashboards) breaks downstream, far from
  where the actual failure happened.
- If the `Student` insert commits first and the status update fails:
  there's now an orphaned `Student` row attached to a user who's
  still `PENDING` — duplicate approval attempts could create a
  second `Student` row for the same user.

Wrapping both writes in a single transaction means the only two
possible outcomes are "both exist" or "neither exists" — there is no
partial state for the rest of the system to trip over.

## Comparison Table

| Property | Guarantee | Fails without it | Example | Enforced by |
|---|---|---|---|---|
| Atomicity | All operations succeed, or none do | Partial writes — data vanishes/appears inconsistently | Debit A + credit B, both or neither | Log |
| Consistency | Every constraint/invariant still holds after commit | Total balance across accounts changes | `balance_A + balance_B` unchanged | Constraints |
| Isolation | Concurrent transactions don't see each other's uncommitted state | Dirty reads, lost updates between concurrent transfers | Two transfers on Account A at once | Locks |
| Durability | Committed changes survive a crash | Acknowledged commit silently lost on crash | WAL entry written before commit is acknowledged | Log |
