# Query Performance — Interview Phrases

## N+1 — One-Liner
"N+1 is fetching a list with one query, then firing one more query
per row for related data — ORMs cause it because lazy loading makes
a related-entity access look like a plain field read in code, while
silently firing a query underneath."

## "How Would You Debug a Slow Query" — Ready Answer
"I'd start with EXPLAIN, or EXPLAIN ANALYZE if I need real numbers
instead of estimates, and look for a sequential scan where an index
scan was expected, or a big gap between estimated and actual row
counts — that usually means stale table statistics. I wouldn't
change anything until the plan actually tells me what's expensive."

## N+1 Fix — JPA/Hibernate Context
"Use JOIN FETCH or @EntityGraph to eagerly fetch a known access
pattern in the original query, or batch fetching when eager-loading
everything isn't appropriate — either way, turn N individual lazy
queries into one or a handful of batched ones."

## Connection Pooling — One-Liner
"Connection pooling reuses a fixed set of already-open DB
connections instead of paying a TCP handshake and auth cost per
request — it matters under load because the database also has a
hard ceiling on concurrent connections it can accept at all."

## One-Liner — Summary
"Profile before optimizing — EXPLAIN is the starting point for every
slow-query investigation, not a guess about what looks slow."
