# Indexes

## Recap
An index is a B+ tree ([[06-database-internals]]) built on one or
more columns, letting the database find matching rows without
scanning the whole table. That file covered how the tree itself
works; this file covers how indexes actually get used — and
misused — in practice.

## How Indexes Work
The index stores the indexed column's value alongside a pointer back
to the actual row. A lookup walks the B+ tree from root to leaf —
per file 06, that's a small, bounded number of page reads even on a
table with millions of rows, instead of touching every row.

**Full table scan vs index seek**: a scan reads every row in the
table and checks each one against the query's condition; a seek
walks directly to the matching leaf(s) via the index and only reads
those. The planner doesn't always pick the seek just because an
index exists — it may deliberately choose a full scan on a small
table (the index's extra page reads aren't worth it when the whole
table fits in a couple of pages anyway) or when the query would match
most of the table's rows anyway (at that point, scanning
sequentially is cheaper than doing a seek for nearly every row).
Worth stating explicitly, since "I have an index but the query still
scanned the table" surprises people who assume an index is always used.

## Clustered vs Non-Clustered

**Clustered index**: the table's actual row data is physically
stored in index order — the leaf nodes of the B+ tree *are* the
rows, not pointers to them. A table can have at most one, since rows
can only be physically ordered one way. In InnoDB, this is the
primary key by default.

**Non-clustered (secondary) index**: the leaf nodes store a
pointer/reference back to the actual row rather than the row itself
— in InnoDB, that reference is the primary key value. A table can
have many of these.

**Practical implication**: looking up a row via a non-clustered
index takes two steps — walk the secondary index to find the
reference, then use that reference to fetch the actual row (in
InnoDB, a second lookup into the clustered index by primary key).
That extra fetch can be skipped entirely if the query is *covered*
by the index — see below.

## Composite Indexes
An index built on multiple columns together, e.g. `(user_id,
created_at)`.

**Column order matters — the left-prefix rule**: the index is only
useful for queries that filter on a left-prefix of its columns.

- Helps: `WHERE user_id = 5` (uses just the first column) and `WHERE
  user_id = 5 AND created_at > '2024-01-01'` (uses both, in order)
- Doesn't help: `WHERE created_at > '2024-01-01'` alone — this skips
  the first column entirely, so the index can't be used for this query

**Why order matters**: the B+ tree is sorted by the first column
first, and only sorted by the second column *within* each value of
the first. Skipping straight to the second column means the tree has
no useful ordering to walk for that lookup — it's the same as not
having an index at all for that query shape.

## Covering Indexes
An index that contains *every* column a query needs — not just the
filter column, but also whatever's being selected. The database
answers the entire query straight from the index, without ever
fetching the actual row.

**Why it's fast**: it skips the extra row-fetch step described in
the Clustered vs Non-Clustered section above entirely — the index
itself already has everything the query asked for.

**Tradeoff**: a wider index (more columns included) costs more
storage, and every insert/update/delete on the table now has to
maintain that wider index too — covering indexes aren't free, they
trade write cost and storage for eliminating the row-fetch step on reads.

## When Not to Index
- **Small tables** — a full scan is often faster than the overhead of
  walking an index, since the whole table might be one or two pages anyway
- **Low-cardinality columns** — a boolean or status column with only
  a handful of distinct values doesn't narrow things down much; the
  planner may ignore the index even if it exists, since scanning
  isn't much worse than seeking when most rows match anyway
- **Write-heavy tables** — every index adds maintenance cost on every
  insert/update/delete. More indexes is not automatically better —
  this is the core tension of the whole file
- **Columns rarely used in WHERE/JOIN/ORDER BY** — an index that
  nothing actually queries against is pure cost with no offsetting benefit

## The Core Tradeoff
Indexing trades read speed against write cost and storage — it is
never "add more indexes = better." Every index is a decision scoped
to a specific query pattern; an index that doesn't match how the
table is actually queried is just overhead on every write with
nothing to show for it on reads.

## Comparison Table

| | Clustered Index | Non-Clustered Index |
|---|---|---|
| Storage | Rows stored in index order — no separate row storage | Separate structure; leaf holds a reference back to the row |
| Lookup cost | Direct — leaf node is the row | Two steps — index lookup, then row fetch (unless covered) |
| Count per table | At most one | Many |

| | Covering Index | Regular Index |
|---|---|---|
| Extra row fetch needed? | No — index alone has every column the query needs | Yes — index locates the row, then the row itself is fetched |
