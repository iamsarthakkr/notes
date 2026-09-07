# Transactions & ACID — Interview Phrases

## Transaction — One-Liner
"A transaction is a sequence of operations treated as one indivisible
action — they all succeed, or none of them do."

## ACID — Recall Speed
"Atomicity: all operations commit, or none of them do."
"Consistency: the database never ends up in a state that violates
its own constraints, even on failure."
"Isolation: concurrent transactions never see each other's
uncommitted changes."
"Durability: once committed, a change survives a crash."

## Project Atomicity Example, Compressed
"Approving a user has to create the Student row and update the
user's status in one transaction, or I risk an approved user with no
Student record."

## "Give an Example of Atomicity" — Ready Answer
"Bank transfer — debiting Account A and crediting Account B has to
be one atomic operation. If the credit to B fails after A's already
been debited, the whole transaction rolls back so the debit is
undone too — otherwise the money just disappears with no record of
where it went."

## One-Liner — Why ACID Matters
"ACID is what lets you treat a multi-step write as one safe operation
instead of manually reasoning about every possible way it could fail halfway through."
