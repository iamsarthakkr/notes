# Pagination — Interview Phrases

## One-Line Definitions
"Offset pagination: LIMIT plus OFFSET — skip N rows, return the next
page's worth."
"Cursor pagination: use a pointer to the last row seen and filter
strictly past it, instead of counting from the start."

## Why Offset Gets Slower With Depth
"OFFSET doesn't skip work, it does the work and discards it — the
database still has to scan and count every row before the offset
before it can return the next page, so cost grows linearly the
deeper you paginate."

## Offset's Correctness Problem
"If a row is deleted or inserted between two page requests, every
row after it shifts position — so the next OFFSET-based page can
either skip a row entirely or show one that was already shown on the
previous page. It's a correctness bug, not just a performance one."

## "How Would You Paginate a Feed With Millions of Rows" — Ready Answer
"I'd use cursor pagination — filter on 'created_at less than the last
row's timestamp' instead of an OFFSET, so it's a direct index seek
regardless of how deep the user has scrolled. It also stays correct
if rows are inserted or deleted while the user's paging through,
since the cursor is a value, not a row count. The tradeoff is it only
supports next/previous, not jumping to an arbitrary page number — for
a feed that's the right tradeoff since nobody's asking for 'page 47.'"

## One-Liner — Summary
"Offset pagination trades away correctness and performance at scale
for the ability to jump to any page; cursor pagination trades away
page-jumping for consistent correctness and performance at any depth."
