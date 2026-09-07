# Pagination

## Recap
[[08-query-performance]] covered that `LIMIT` combined with `ORDER
BY` needs a matching index or the database still sorts the entire
result set first. This file covers the two dominant pagination
strategies built on top of that, and why the naive one breaks down
as a table grows.

## Offset Pagination
`LIMIT` + `OFFSET` — e.g. `LIMIT 20 OFFSET 100` to get page 6 (rows
101–120).

**How it actually executes**: the database doesn't skip straight to
row 101. It has to walk through and count the first 100 matching
rows, discard them, and only then start returning the next 20.
`OFFSET` doesn't skip work — it does the work and throws the result away.

```sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100;
```

**Why it gets slower as page number increases**: `OFFSET 10000` means
scanning 10,020 rows to return the 20 the client actually wants — the
cost grows linearly with how deep into the result set the page is,
regardless of how few rows are actually returned. Page 6 is cheap;
page 5,000 is not, even though both requests return exactly 20 rows.

**Correctness problem, not just a performance one**: if rows are
inserted or deleted between page requests, offset pagination can
skip rows or show duplicates, because "page N" is really just "the
Nth batch of whatever currently matches the ORDER BY" — and that set
can shift underneath you between requests.

Concrete example: a client has just loaded page 2 (`OFFSET 20 LIMIT
20`, rows 21–40). Before they request page 3, someone deletes what
was row 15. Every row after it shifts up by one — what was row 21 is
now row 20, and what was row 41 is now row 40. The client's next
request, `OFFSET 40 LIMIT 20`, now starts at what used to be row 41
— but row 40 (formerly row 41) just got shown on page 2 *and* would've
been skipped correctly before the delete. In practice this shows up
as either a row silently disappearing from the results the user
scrolls through, or a row appearing twice across two pages, depending
on which direction the shift happened.

**When it's still fine**: small tables (the scan cost is negligible
regardless of offset), admin panels and internal tools (low traffic,
low page depth, correctness glitches are tolerable), and — the one
case cursor pagination genuinely can't cover — when jumping directly
to an arbitrary page number is a real product requirement.

## Cursor Pagination
Instead of an offset, use a pointer (cursor) to the last row the
client actually saw. The next page's query filters strictly past
that cursor instead of counting from the start.

```sql
SELECT * FROM posts
WHERE created_at < :last_seen_cursor
ORDER BY created_at DESC
LIMIT 20;
```

**Why it's fast at any depth**: this is a direct index seek to the
cursor's position — the database jumps straight there via the B+
tree index, it doesn't scan and discard everything before it. Cost
stays flat whether this is page 2 or page 5,000.

**Why it's correct under concurrent writes**: a new row being
inserted (or an old one deleted) elsewhere in the table doesn't shift
where the cursor points — the cursor is a value (e.g. a specific
`created_at`), not a position/count. The next page query is always
"everything strictly past this specific value," which stays correct
regardless of what else happened to the table in between.

**Requirement**: the cursor column (or combination of columns) has to
be unique and orderable, so "everything past this cursor" is
unambiguous. In practice this is usually a timestamp plus a tie-break
id: if two rows share the exact same `created_at`, ordering by
`created_at` alone can't tell them apart, so the query needs a
secondary sort key — `ORDER BY created_at, id` with a cursor of
`(created_at, id)` — to guarantee a stable, unambiguous position even
when timestamps collide.

**Limitation**: cursor pagination can only go forward or backward
from where you are — next/previous — it cannot jump to an arbitrary
page number, because there's no way to know what cursor value
corresponds to "page 47" without doing the scan-and-discard work
offset pagination does. This is a real product tradeoff, not a minor
technical footnote — if the UI needs a page-number selector, cursor
pagination doesn't support that directly.

## The Core Tradeoff
Offset pagination gives you jump-to-page-N, at the cost of
degrading performance and correctness as the table and page depth
grow. Cursor pagination gives you consistent performance and
correctness at any depth, at the cost of only supporting sequential
next/previous navigation. Which one to pick depends on what the
product actually needs: page-jumping is a rare, specific requirement
(admin tools, some search UIs); infinite-scroll-style sequential
navigation — feeds, timelines, activity logs — is the common case,
and that's exactly the shape cursor pagination is built for.

## Comparison Table

| | Offset Pagination | Cursor Pagination |
|---|---|---|
| Performance at depth | Degrades linearly — deeper pages cost more | Flat — cost independent of page depth |
| Correctness under concurrent writes | Can skip or duplicate rows if data shifts between requests | Stable — cursor is a value, unaffected by shifts elsewhere |
| Supports jump-to-page | Yes | No — next/previous only |
| Implementation complexity | Simple — plain LIMIT/OFFSET | Slightly more — needs a unique, orderable cursor (often with a tie-break column) |
