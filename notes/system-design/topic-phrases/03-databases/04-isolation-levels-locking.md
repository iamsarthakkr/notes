# Isolation Levels & Locking — Interview Phrases

## Read Anomalies — One-Liners
"Dirty read: reading another transaction's change before it's even committed."
"Non-repeatable read: re-reading the same row twice in one transaction
and getting a different value because someone else committed in between."
"Phantom read: re-running the same query twice and getting a
different set of rows because someone else inserted or deleted matching rows."

## What Each Level Prevents — Recall Speed
"Read Committed: prevents dirty reads, nothing else."
"Repeatable Read: prevents dirty and non-repeatable reads — and on
MySQL specifically, gap locks prevent most phantoms too, though
that's a MySQL-specific behavior, not the SQL standard's guarantee."
"Serializable: prevents all three — transactions behave as if run one at a time."

## "What Isolation Level Would You Use and Why" — Ready Answer
"For the approval flow, default Read Committed isn't enough, because
two admins approving the same registration is a read-then-write
race, not a dirty-read problem. I'd use `SELECT ... FOR UPDATE` on
the specific user row being approved, so the second admin's
transaction blocks, then reads the already-approved status and
correctly no-ops instead of creating a duplicate Student record."

## SELECT FOR UPDATE
"It reads a row and takes an exclusive lock on it in the same
statement, so no other transaction can update or lock that row until
this one commits or rolls back."
"Reach for it when there's real contention on the same row and
correctness matters more than throughput — seat booking, inventory
decrement, anything where two transactions acting on stale data
would cause a real bug."

## One-Liner — Core Tradeoff
"Every step up in isolation or locking strictness buys you a
stronger correctness guarantee at the direct cost of concurrency —
there's no level that gives you both for free."
