# Database Internals

## Why Internals Matter for Interviews
You don't need to be able to build a database, but knowing what's
underneath is what turns "indexes are fast" and "commits are
durable" from memorized facts into things you can actually reason
about — why indexes are fast (B+ trees + pages), why WAL gives
durability (ties back to [[03-transactions-acid]]), and why certain
queries are slow despite "having an index." This file is the
foundation the next two files — indexing, and query performance —
build directly on top of.

## Storage Pages
A database doesn't read or write individual rows to disk — it reads
and writes fixed-size blocks called **pages**, typically 8KB
(Postgres) or 16KB (InnoDB) depending on the engine.

Why: disk I/O is expensive per-operation — the cost is dominated by
the seek/request overhead, not the number of bytes moved. Batching
many rows into one page means a single disk read pulls back many
rows at once instead of paying that per-operation cost once per row.

Rows are packed into pages; a table, physically, is really just a
collection of pages on disk.

## B+ Trees
The data structure almost all relational database indexes are built
on — and often the table's own storage too (e.g. InnoDB stores the
table itself as a B+ tree keyed on the primary key, its "clustered index").

Structure at a high level:
- A balanced tree — every leaf is the same distance from the root
- All actual data (the indexed values, or in a clustered index, the
  full row) lives in the **leaf nodes**
- Leaf nodes are linked together in order, so scanning a range means
  walking sideways along the leaves instead of re-searching the tree
- Internal nodes hold no data — they exist purely to guide the search
  down to the right leaf

Why B+ tree specifically, not a binary tree or a hash table:
- **Shallow and wide** — each node holds many keys (as many as fit in
  one page), matching how pages actually work. That means a lookup
  on a huge table still only touches a handful of pages/disk reads,
  because the tree's height stays small even as the row count grows
  into the millions
- **Supports range queries naturally** — the linked leaves let you
  find the start of a range and then scan forward. A hash index
  can answer "does this exact value exist?" fast, but can't answer
  "give me everything between X and Y" at all — full comparison
  saved for the indexes file

This file deliberately doesn't go into insert/split/rebalancing
mechanics — that's a conscious scope cut; it's not needed at
interview depth.

## Write-Ahead Log (WAL)
Recap from [[03-transactions-acid]]: the durability mechanism —
write the change to an append-only log *first*, only then modify the
actual data pages, so a crash right after commit can always be
recovered by replaying the log.

Why append-only: sequential writes to the end of a log are much
faster than random writes scattered across whichever data pages a
transaction happens to touch. WAL gets durability without paying full
random-I/O cost on every single transaction — the expensive random
writes to the actual data pages can happen later, lazily, while the
cheap sequential log write is what the commit actually waits on.

**Checkpointing**: periodically, the database flushes the actual data
pages so they catch up to what the log already recorded, and marks
that point as a checkpoint. This keeps the log from growing forever
and means recovery after a crash only has to replay from the last
checkpoint forward — not from the beginning of the database's
entire history.

## Buffer Pool
An in-memory cache of recently used pages, sitting between the
database engine and disk.

Why it exists: reading from RAM is orders of magnitude faster than
reading from disk, and most real workloads have a "working set" —
the pages actually touched often — that's much smaller than the full
table. Caching those hot pages in memory means most reads never
touch disk at all.

**Eviction**: when the buffer pool fills up, the least-recently-used
pages get evicted to make room for new ones — the general idea
matters more here than any specific eviction variant.

**Practical implication**: a query that's slow the first time and
fast the second time isn't doing anything magic — the first run
pulled the relevant pages off disk into the buffer pool, and the
second run found them already sitting in memory.

## Query Planner
Before actually running a query, the database decides *how* to run
it — which indexes to use, what order to join multiple tables in,
whether to scan the whole table or seek directly via an index.

Why it matters: the same SQL statement can be executed in many
different ways with wildly different costs. The planner picks a
strategy based on **table statistics** it maintains internally — row
counts, how values are distributed, index selectivity.

**Stale statistics are a real practical gotcha**: if those statistics
are outdated — commonly right after a large bulk load — the planner
can pick a genuinely bad plan (e.g. a full table scan where an index
would've been far cheaper), because it's making its decision off a
picture of the data that no longer matches reality.

This file doesn't cover cost-based optimization internals — just
that a real decision gets made, and that decision is inspectable
(via `EXPLAIN`, covered in full in the query-performance file).

## How These Five Pieces Connect
A query comes in → the planner decides a strategy, typically using a
B+ tree index to avoid scanning the whole table → the pages that
strategy needs get fetched through the buffer pool, either a cache
hit (fast, in memory) or a disk read (slow, page pulled in and
cached for next time) → any writes that result go through the WAL
first, so the transaction is durable the instant it commits,
regardless of when the actual data pages get updated on disk.

## Comparison Table

| Concept | Problem it solves | What breaks without it |
|---|---|---|
| Pages | Amortizes expensive per-operation disk I/O across many rows | Every row read/written pays full disk-operation cost individually |
| B+ Trees | Fast lookups and range scans even on huge tables, in very few disk reads | Lookups degrade toward a full scan; no efficient range queries |
| WAL | Durability without paying random-I/O cost on every commit | Either commits are slow (full random write every time) or crashes lose data |
| Buffer Pool | Avoids disk I/O for frequently accessed pages | Every read hits disk, even for the same hot rows repeatedly |
| Query Planner | Picks a low-cost execution strategy among many possible ones | The database has no way to avoid an accidentally terrible execution plan |
