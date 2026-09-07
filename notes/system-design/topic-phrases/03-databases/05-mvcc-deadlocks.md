# MVCC & Deadlocks — Interview Phrases

## MVCC — One-Liner
"MVCC gives each transaction a consistent snapshot of the data by
keeping multiple row versions, instead of blocking readers behind
writers or writers behind readers."

## Write Skew — One-Liner + Example
"Write skew is when two transactions each read the same shared value,
each independently decide their own change is safe based on that
read, and both commit — and the combined result breaks a constraint
neither transaction individually violated: like two on-call doctors
each independently going off-call because each saw the other still on call."

## Deadlock — One-Liner
"A deadlock is a circular wait — Transaction A holds a lock B needs,
B holds a lock A needs, and neither can proceed."

## "How Would You Handle a Deadlock in Production" — Ready Answer
"Deadlocks are expected under locking, so I don't try to prevent them
entirely — the database detects the circular wait, kills one
transaction as the victim, and returns an error. My code has to catch
that specific error and retry the transaction; the actual bug would
be not retrying, not the deadlock itself. Where it's cheap to do, I'd
also enforce a consistent lock acquisition order — like always
locking the lower ID first — to reduce how often it happens at all."

## One-Liner — Summary
"MVCC solves read/write blocking, not every concurrency bug — write
skew and lost updates are still possible, they just show up as a
different failure mode than a deadlock."
