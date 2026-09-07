# Database Scaling

## Why Scaling the Database Is Different
Application servers scale horizontally easily because they're
stateless — need more capacity, add more instances, load balance
across them, done. The database holds state, so scaling it means
solving a genuinely different problem: how do you keep multiple
copies or pieces of that state correct, in sync, and reachable, when
you can no longer just point traffic at any instance and get an
identical answer. This file covers the main strategies, roughly in
the order you should actually reach for them.

## Replication
Copying data from one database (the **primary**/leader) to one or
more additional databases (**replicas**/followers).

**How writes flow**: all writes go to the primary. The primary then
replicates those changes out to each replica — either synchronously
or asynchronously.

- **Sync replication**: the primary waits for a replica to confirm
  it received the write before acknowledging the write as successful
  to the client. Safer — a replica is guaranteed to be caught up at
  the moment of acknowledgment — but slower, since every write now
  waits on a network round trip to at least one replica.
- **Async replication**: the primary acknowledges the write
  immediately and replicates to replicas afterward, in the
  background. Faster, since the client doesn't wait on replication at
  all — but the replica can fall behind, which is replication lag.

**Replication lag**: the delay between a write committing on the
primary and that same write showing up on a replica. It happens
because async replication doesn't wait for a replica to keep up in
real time — under load, or over distance, a replica can genuinely
fall seconds (or more) behind.

Concrete consequence: a user updates their profile (write goes to
the primary), immediately reloads the page (read gets routed to a
replica), and the replica hasn't caught up yet — the user sees their
own old data immediately after saving a change.

## Read Replicas
Using replication specifically to offload **read** traffic — writes
still go only to the primary, but reads get distributed across one
or more replicas instead of all hitting the primary.

**When it helps**: read-heavy workloads, which is most web
applications (far more reads than writes); reporting and analytics
queries, which are often long-running and would otherwise compete
directly with production traffic for the primary's resources.

**When it doesn't help**: write-heavy workloads — read replicas do
nothing for write throughput, since every replica still has to
receive and apply every single write the primary does. It also
doesn't help when the application needs strong read-after-write
consistency, given replication lag means a read right after a write
can return stale data, as above.

## Partitioning
Splitting one large table into smaller pieces. **Horizontal
partitioning** splits by rows (e.g. orders from 2023 in one
partition, 2024 in another); **vertical partitioning** splits by
columns (e.g. rarely-used columns moved to a separate table) — brief
mention only, horizontal is what matters for scaling and the rest of
this file.

**Why**: a single table or its index can get too large to fit
efficiently in the buffer pool ([[06-database-internals]]), so more
of every query's working set ends up going to disk. Very large
tables also make maintenance operations — backups, index rebuilds —
slow and disruptive at full-table scale; partitioning lets those
operations run per-partition instead.

Partitioning can happen entirely on a **single database instance** —
it's still one server, just logically split into smaller pieces
internally. This is the key distinction from sharding, next: no new
servers, no cross-machine routing, just a friendlier internal shape
for the same table.

## Sharding
Partitioning taken further — splitting data across **multiple
database instances/servers**, not just logically within one.

**Sharding key**: the column used to decide which shard a given row
belongs to (e.g. `user_id`). The choice of key determines which
query patterns stay fast and which get expensive: queries that
filter by the shard key route directly to the one shard that has the
answer, staying fast regardless of total data size. Queries that need
data spanning many shards — or joins/transactions across shards — get
expensive, because now multiple servers have to be contacted and
their results combined by the application or a coordinating layer.

**Real cost**: application complexity goes up significantly — the
app (or a routing layer) has to know which shard to query, cross-shard
joins generally aren't practical the way a same-instance join is, and
cross-shard transactions are genuinely hard to make atomic (this is
where distributed transactions / two-phase commit come in — covered
in a much later phase, not here).

**When it's actually needed**: sharding is a last resort, reached for
only after replication and partitioning stop being enough. Most
systems never need to shard at all. Reaching for it early — before
there's a real, measured need — adds enormous operational and code
complexity for no actual benefit yet.

## Hot Spots / Hot Partitions
A single row, partition, or shard receiving disproportionate traffic
relative to the rest of the data.

Concrete examples: a viral post's like-count row getting hammered by
thousands of concurrent increments; a celebrity user's profile row
getting far more reads than any typical user's; a top-selling
product's inventory row taking concurrent decrements from every
checkout, while the rest of the table sees ordinary traffic.

**Why it's a problem even when overall system capacity is fine**:
sharding and partitioning distribute load on the assumption that
access patterns are roughly even across rows/shards. A hot spot
breaks that assumption — it concentrates load back onto one specific
node or row, causing lock contention ([[05-mvcc-deadlocks]]) or a
single overloaded shard, even while the cluster as a whole has plenty
of spare headroom everywhere else.

**Fixes**:
- **Sharded counters** — split a single counter into N separate rows;
  writes go to one randomly chosen row, reads `SUM` across all N.
  Spreads write load across N rows instead of contending on one, at
  the cost of a slightly more expensive read
- **Async aggregation** — batch updates instead of writing on every
  single event (e.g. buffer like-clicks in memory/a queue and flush
  an aggregate count periodically, instead of an `UPDATE` per click)
- **Caching hot rows** — put the hot row in a cache (Redis — covered
  properly in Phase 6) so most reads never reach the database at all
- **Random shard suffix on writes** — for specifically known-hot
  entities, append a random suffix to the sharding key so their
  writes spread across multiple shards instead of all landing on one
- **Dedicated shard for known-hot data** — isolate hot entities onto
  their own shard entirely, so their load doesn't degrade the rest of
  the cluster

## The Closing Tradeoff
Replication solves read scaling — it does nothing for write
throughput and doesn't give strong consistency by default.
Partitioning and sharding solve both read and write scaling, but at a
steep complexity cost and with entirely new failure modes, hot spots
being one of them. Scale in that order — replicate first, partition
when a single table/index gets unwieldy, shard only when replication
and partitioning genuinely aren't enough. Jumping straight to
sharding "to be safe" trades a problem you don't have yet for
complexity you'll definitely have.

## Comparison Table

| | Replication | Partitioning | Sharding |
|---|---|---|---|
| What it solves | Read scaling | Table/index size, maintenance cost | Read *and* write scaling |
| Complexity added | Low — mostly transparent to the app | Moderate — still one instance | High — routing logic, no easy cross-shard joins/transactions |
| Single point of failure risk | Primary is still one node for writes | Still one instance overall | Reduced overall, but each shard is its own point of failure for its slice of data |
