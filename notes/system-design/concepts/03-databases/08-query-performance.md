# Query Performance

## Recap
[[06-database-internals]] introduced the query planner as a black
box that picks an execution strategy. [[07-indexes]] covered indexes
as one of the tools the planner can reach for. This file covers how
to actually diagnose and fix a slow query in practice.

## EXPLAIN
Asks the database to show the plan it *would* use for a query —
which indexes it hits, the join order, whether it does a sequential
scan or an index scan, and its estimated row counts. `EXPLAIN
ANALYZE` actually runs the query and shows the real numbers alongside
the estimates.

**What to actually look for**:
- A sequential scan on a large table where an index scan was expected
- A large gap between estimated and actual row counts — usually
  means the table's statistics are stale (per file 06), so the
  planner is working off a picture of the data that no longer
  matches reality
- Nested loop joins running over large row counts — cheap per
  iteration, but that cost multiplies badly once either side of the
  join is big
- No index used at all on a column that clearly has one — check
  whether the query shape actually matches what the index supports
  (left-prefix rule, functions on the column, etc.)

**EXPLAIN vs EXPLAIN ANALYZE**: `EXPLAIN` alone just shows the
planned strategy without running anything — safe to run on anything,
anytime. `EXPLAIN ANALYZE` actually executes the query to get real
timing and row-count numbers — which means it's the real query,
including any real writes. Be careful running `EXPLAIN ANALYZE` on
an `UPDATE`/`DELETE`/`INSERT` — it genuinely performs the write.

## Query Optimization Patterns

**Select specific columns, not `SELECT *`** — reduces the amount of
data transferred, and can let the query be answered entirely by a
covering index (file 07) instead of requiring a full row fetch.

**Filter early** — apply `WHERE` conditions before a `JOIN` narrows
the row count going into the join, rather than joining everything
first and filtering the combined result afterward. Filtering after a
large join means the join itself did far more work than the final
result needed.

**Avoid functions on indexed columns in WHERE** — wrapping an
indexed column in a function forces the database to evaluate that
function on every row, which defeats the index entirely.

```sql
-- Bad: index on created_at can't be used — function wraps the column
WHERE YEAR(created_at) = 2024

-- Good: index on created_at is used directly — a plain range comparison
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

**`LIMIT` with `ORDER BY` needs a matching index** — without an
index on the `ORDER BY` column(s), the database still has to sort
the *entire* result set before it can take the top rows requested by
`LIMIT`. `LIMIT` alone doesn't make the sort cheap.

## N+1 Problem
Fetching a list with one query, then firing one *additional* query
per row to fetch related data — N+1 total queries where 1 or 2
would've done the job.

Concrete example: fetching 50 orders with one query, then looping
over them and querying customer info for each order individually —
1 + 50 = 51 queries where a single join could've answered it in one.

**Why it's easy to miss**: ORMs like JPA/Hibernate hide this behind
lazy loading. `order.getCustomer().getName()` in code looks like a
plain object access, but under lazy loading it silently fires a
fresh query the first time that relationship is touched — the N+1 is
invisible at the call site and only shows up as a burst of queries in
the logs or a slow endpoint.

**Fixes, Spring/JPA specifically**:
- `JOIN FETCH` in JPQL, or `@EntityGraph`, to eagerly fetch a known
  access pattern in the original query instead of lazily loading
  per-row later
- Batch fetching (`@BatchSize` / `hibernate.default_batch_fetch_size`)
  to turn N individual lazy-load queries into a handful of batched
  `IN (...)` queries when eager-fetching everything isn't appropriate
- For GraphQL resolvers specifically, DataLoader-style batching —
  collect all the individual lookups requested within one request
  cycle and resolve them as one batched query instead of one per field access

## Connection Pooling
Reusing a fixed set of already-open database connections instead of
opening a new one per request. Opening a connection means a TCP
handshake plus authentication — genuinely expensive relative to
running a typical query.

**Why it matters**: without pooling, that per-request connection
overhead can dominate total request time under load, and the
database has a hard ceiling on how many concurrent connections it can
handle at all — exceeding it causes new connection attempts to fail
outright, not just slow down.

**Pool sizing tradeoff**: too small, and requests queue up waiting
for a free connection even though the database itself has spare
capacity. Too large, and either the database gets overwhelmed by
more concurrent work than it can actually handle, or connections sit
mostly idle, each still costing the database memory. Pool size
should be sized to the database's actual capacity to handle
concurrent connections — not scaled up just because there are more
application instances.

**HikariCP** is Spring Boot's default connection pool — fast and
low-overhead out of the box; not covered in config depth here.

## The Core Tradeoff
Query optimization work isn't free — it costs engineering time, adds
code complexity (batch fetching, entity graphs, denormalized reads),
and can easily become premature optimization aimed at a query that
was never actually a problem. Profile first with `EXPLAIN` before
touching anything — optimize based on what's actually measured slow,
not what looks like it might be slow.

## Comparison Table

| | Sequential Scan | Index Scan |
|---|---|---|
| When the planner picks it | Small tables, or queries matching most of the table's rows | Selective queries on a large table with a usable index |
| Relative cost | Scales with total row count | Scales with result size, roughly independent of table size |

| | N+1 (Unbatched) | Batched/Joined Fetch |
|---|---|---|
| Number of queries | 1 + N (one per row) | 1 or a small constant number |
| Latency impact at scale | Grows linearly with row count — dominates at high N | Stays roughly flat regardless of row count |
