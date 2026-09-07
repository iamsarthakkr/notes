# Normalization & Denormalization — Interview Phrases

## Explaining Normalization and Why It Matters
"Normalization means each fact lives in exactly one place, so
there's exactly one row to update when it changes. Without it you
get anomalies — updating a duplicated fact in some rows but not
others, deleting a row and losing an unrelated fact along with it, or
not being able to record a fact at all until something unrelated
exists first. 1NF through 3NF just progressively remove different
shapes of that duplication."

## When to Denormalize and How to Justify It
"I start every schema fully normalized — that's the correct default.
I only denormalize when a specific read path is measurably too slow
or too frequent at the scale I'm actually operating at, not
preemptively. The justification has to be a real, identified read
pattern, because denormalizing trades away write simplicity, and
that's not a trade worth making speculatively."

## Snapshot Fields Pattern
"For a feed-style read — post content plus the author's username and
avatar — I'd rather store a username and avatar snapshot directly on
the post row than JOIN to the users table on every read. It costs me
staleness if the user changes their name later, which I'd usually
accept for a feed, but I'd call that out explicitly as a decision,
not an oversight."

## Reads vs Writes Tradeoff Framing
"Denormalization is fundamentally a read/write tradeoff — you make
reads cheap by duplicating data, which makes writes more expensive
because now a single logical change has to propagate to every
duplicate. That propagation is usually a background sync job or an
event stream, which means accepting eventual consistency somewhere
in the system in exchange for read performance."

## One-Liner
"Normalize for correctness by default, denormalize only where a
specific read path proves it's needed — and every denormalization is
really just moving cost from reads to writes, not eliminating it."
