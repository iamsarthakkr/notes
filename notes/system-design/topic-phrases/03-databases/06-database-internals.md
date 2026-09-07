# Database Internals — Interview Phrases

## One-Line Definitions
"Page: the fixed-size block — 8KB or 16KB depending on the engine —
that the database actually reads and writes, never individual rows."
"B+ tree: the balanced tree structure behind almost every relational
index, where all the data lives in linked leaf nodes for fast lookup and range scans."
"WAL: an append-only log that records a change before the actual
data pages are updated, so a crash after commit is always recoverable."
"Buffer pool: an in-memory cache of recently used pages sitting
between the engine and disk."
"Query planner: the component that decides how to execute a query —
which indexes, what join order, scan or seek — before actually running it."

## Why B+ Trees Specifically
"B+ trees are shallow and wide, so even on a huge table a lookup only
touches a handful of pages instead of a deep chain of comparisons.
Their linked leaf nodes also support range scans directly, which a
hash index fundamentally can't do."

## Why WAL Avoids Full Random I/O Cost
"WAL turns durability into one cheap sequential write to the end of
a log, instead of making every commit wait on the random-I/O cost of
updating scattered data pages immediately."

## "Why Is My Query Slow the First Time But Fast After" — Ready Answer
"The first run pulls the pages it needs off disk into the buffer
pool, which is the slow part. The second run finds those same pages
already cached in memory, so it skips disk I/O entirely — that's the
buffer pool doing its job, not the query itself changing."

## One-Liner — Summary
"Pages, B+ trees, WAL, the buffer pool, and the query planner are the
actual mechanics behind why indexes are fast and commits are durable
— everything in files 03 and 04 is built on top of these five things."
