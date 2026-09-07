# Capacity Estimation — Interview Phrases

## Opening Estimation
"Let me do a quick back-of-envelope estimate before designing — 
I want the scale to drive the architecture, not the other way around."

## Stating Scale
"At [X] DAU with [Y] actions per user per day, we're looking at 
roughly [Z] requests per second at peak — that tells me we need 
[implication]."

## Read vs Write
"This is a read-heavy system — about [ratio] reads to writes — 
so my first instinct is read replicas and caching before I think 
about write scaling."

## Storage
"At [X] per record and [Y] records per day, we're looking at 
[Z] TB/day — that immediately tells me this belongs in object 
storage, not a relational DB."

## Letting Numbers Drive Decisions
"Given these numbers, [X] is the constraint here — so the 
architecture needs to solve for that first."
