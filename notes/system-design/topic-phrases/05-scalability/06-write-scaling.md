# Write Scaling — Interview Phrases

## One-Liners
"Write scaling means handling more create/update/delete ops. It's
harder than read scaling because writes usually need one source of
truth."

## Why the Write Path Breaks Down
"The basic write path breaks down under growth: more index
maintenance, more locks/replication, more WAL writes."

## Reducing and Shrinking Writes
"Reducing unnecessary writes: not every write needs to happen
immediately — batch or async it instead."
"Making writes smaller: minimize what's on the hot path — every write
costs a row write, an index update, and replication."

## Batch Writes
"Batch writes: group updates — e.g. every 1,000 — to cut DB round
trips. Good for analytics, metrics, logging."

## Async Processing
"Async processing: do the critical part synchronously, push the rest
— notifications, counters, search index, fanout — to background
workers. Trades immediacy for eventual consistency."

## Hot Rows
"Hot rows: too many concurrent writes to one row causes lock
contention. Fix with sharded counters, async aggregation, or a
separate stats table."

## Write Consistency vs Correctness
"Write consistency vs correctness: likes/views/notifications/analytics
can be eventually consistent; payments/inventory/password changes need
strong consistency. This decides what you're allowed to batch/async/
shard."

## Viral Post Problem
"Viral post problem: 10M likes on one post causes lock contention on a
single counter row. Fix: sharded counters (post_id + shard_id), sum or
periodically aggregate for the total."

## Partitioning/Sharding
"Partitioning/sharding is the last resort for write scaling — reach
for it after batching/async/hot-row fixes are exhausted, not before."
"Sharding tradeoffs: harder cross-shard queries, complex multi-shard
transactions, more ops overhead."

## Queue-Based Write Buffer
"A queue-based write buffer puts a queue in front of the DB to absorb
write spikes the DB can't sustain directly — trades latency for
durability under load."

## Idempotency
"Idempotency keys prevent a retried write from being applied twice —
critical for payments, orders, bookings, transfers."

## Scaling Ladder
"Scaling ladder, cheapest to most drastic: optimize schema → small
sync writes → avoid unnecessary writes → batch → async → avoid hot
rows → partition/shard → queues → idempotent writes."
