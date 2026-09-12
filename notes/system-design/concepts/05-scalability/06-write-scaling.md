# Write Scaling

## What Write Scaling Is
Write scaling is a system's ability to handle more create/update/
delete operations.

Writes are usually harder to scale than reads. Reads are easy to
copy — replicas — and often only need to be eventually consistent
(see [[05-read-scaling]]). Writes usually need a single source of
truth: the primary DB. This is exactly what pulls in locks,
transactions, consistency, hot partitions, and idempotency as real
concerns.

The basic write path works fine at small scale, but as traffic
grows: more inserts/updates mean more index maintenance work, more
locks and replication work, and more WAL (write-ahead log) writes —
eventually the DB itself becomes the bottleneck.

## Reducing Unnecessary Writes
Not every write needs to happen immediately or synchronously. A
"like" action updating a likes counter doesn't need to update it
synchronously on every single like — this can be done asynchronously
or batched instead.

## Making Writes Smaller
Avoid storing unnecessary data in hot write paths — keep the
synchronous write minimal, and push the remaining work to async.

Every write has a real cost: the row write itself, index updates, and
replication. Minimizing what's written on the hot path reduces all
three at once.

## Batch Writes
Improve DB round-trip efficiency by batching updates together instead
of writing one at a time — e.g. batch every 1,000 updates together.

Common use cases: analytics, metrics, logging, precomputed
aggregations — anywhere near-real-time isn't actually required.

## Async Processing
Do only the critical part of a write synchronously; push everything
else to background workers.

Example: a comment is saved synchronously and a response is returned
to the user immediately. The async path then handles updating the
comment count, sending notifications, updating the search index, and
fanning out to followers.

**Tradeoff.** This introduces eventual consistency for everything
pushed to the async path.

## Avoiding Hot Rows
Receiving too many concurrent writes to a single row — e.g. a viral
post's like counter — causes lock contention, since every write has
to serialize against the same row.

Better approaches: sharded counters (spread writes across multiple
sub-rows/counters, sum them for reads), async aggregation, or a
separate stats table decoupled from the main record.

## Write Consistency vs Write Correctness
Some writes can tolerate eventual consistency: like counts, view
counts, notifications, analytics — being briefly stale doesn't cause
real harm.

Some writes need strong consistency: payments, inventory, password
changes — being stale or wrong here has real consequences.

This distinction is what determines the rest of your write-scaling
design: eventually-consistent writes are free to be batched, made
async, or sharded aggressively; strongly-consistent writes are not.

## Practical Example: Likes at Scale
Likes at scale surface two distinct write-scaling problems in one
feature.

**The viral post write problem.** A post goes viral and 10M users
like it around the same time. Naively incrementing a single
post-stats counter row causes severe lock contention — every like
write serializes against the same row.

**Fix: sharded counters.** Instead of one counter row per post, split
it into multiple shard rows (e.g. `post_id + shard_id`, each holding a
partial count). Each like update now only contends for its own shard
instead of a single global row, spreading lock contention across
multiple rows.

Reading the total: either SUM across all shards for that post, or
maintain a periodic aggregation when an exact real-time total isn't
required — this is the eventually-consistent write from the section
above, in action.

A shard here can be the same table with multiple partitions, or a
separate DB — depends on scale.

This is the same underlying idea as "Avoiding Hot Rows" above and
partitioning below — this worked example is what ties both together
in a single real scenario.

## Partitioning/Sharding (The Endgame of Write Scaling)
If total write volume becomes too high for one DB, split the data
across partitions/shards more broadly than a single hot table — per
the likes example above, generalize sharded counters into sharded
tables.

Reach for this only after the earlier write-scaling strategies —
reducing writes, batching, async, avoiding hot rows — aren't enough.
It's a last resort, not a first move.

**Tradeoffs.** Harder cross-shard queries, complex multi-shard
transactions, more operational overhead.

## Queue-Based Write Buffer
Sometimes the DB can't absorb sudden write spikes — e.g. normal load
is 10K writes/sec, a spike pushes it to 500K writes/sec.

Fix: put a queue in front of the DB. The app writes to the queue, and
a pool of workers consumes from the queue and writes to the DB at a
rate the DB can actually sustain.

**Tradeoff.** Higher latency — writes aren't immediately durable in
the DB, just in the queue — and queue failure handling and retry
logic become necessary.

## Idempotency
Write requests may be retried — a network blip, a client retry, a
double-click. Without protection, a retried write can be applied
twice.

Fix: idempotency keys — the same key plus the same operation returns
the previously saved result if it's already been done, instead of
repeating the write.

This matters most for payments, orders, bookings, transfers —
anywhere a duplicate write has real-world consequences (double-
charging, double-booking).

## Scaling Ladder
The practical order to work through when a write path is struggling —
cheap code-level fixes first, architectural changes last:

1. Optimize schema and indexes
2. Keep writes small and synchronous only where necessary
3. Avoid unnecessary writes
4. Batch non-critical writes
5. Push derived work async
6. Avoid hot rows
7. Partition/shard high-volume tables
8. Use queues to absorb spikes
9. Design idempotent writes

## The Recurring Theme
Write scaling strategies generally trade immediacy/consistency for
throughput. The recurring question is "does this write need to happen
right now, on this exact row, synchronously" — and pushing back on
"yes" wherever possible.
