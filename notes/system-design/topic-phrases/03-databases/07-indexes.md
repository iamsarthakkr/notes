# Indexes — Interview Phrases

## One-Line Definitions
"Clustered index: the table's rows are physically stored in index
order, so the leaf nodes are the rows themselves — a table gets at most one."
"Non-clustered index: a separate structure whose leaf nodes point
back to the actual row rather than containing it — a table can have
several."
"Composite index: one index built across multiple columns together, in a specific order."
"Covering index: an index that already contains every column a query
needs, so the database never has to fetch the actual row."

## Left-Prefix Rule
"A composite index only helps a query that filters on a left prefix
of its columns, in order — it's unusable if the query skips the
first column. An index on `(user_id, created_at)` helps `WHERE
user_id = 5` and `WHERE user_id = 5 AND created_at > X`, but does
nothing for a query that filters on `created_at` alone."

## "When Would You NOT Add an Index" — Ready Answer
"I wouldn't index a low-cardinality column like a boolean or status
flag, since it doesn't narrow the result down enough for the planner
to prefer it over a scan. I also wouldn't add one to a write-heavy
table just speculatively, since every index adds maintenance cost to
every insert and update — an index only pays for itself if it
actually matches a real query pattern."

## One-Liner — Summary
"Indexing is a tradeoff, not a free win — you're trading write cost
and storage for read speed, and only for the specific query patterns
the index was actually built for."
