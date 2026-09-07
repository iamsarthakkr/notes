# CQRS Basics — Interview Phrases

## One-Liner
"CQRS means using separate models for writes (commands) and reads
(queries) instead of one model handling both."

## Why It Exists
"Read and write workloads often have genuinely different shapes —
reads are usually much higher volume and benefit from denormalized,
precomputed data, while writes need strict validation and
consistency. A single shared model is a compromise that's not ideal
for either side."

## Common Misconception
"CQRS doesn't require event sourcing — they're independent ideas; you
can do CQRS with a plain database and a simple sync job."

## "When Would You Use CQRS?" — Ready Answer
"Only when read and write patterns have genuinely diverged — like a
transactional core with heavy reporting or analytics on top, where the
query side needs a totally different shape than the write side. It's
not a default choice; most CRUD systems are served fine by a single
model, and CQRS just adds complexity and eventual consistency without
a real benefit."

## Closing Summary
"Separate models for reads and writes, kept in sync — often via
events — trading complexity for the ability to optimize each side
independently."
