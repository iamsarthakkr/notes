# Database Scaling — Interview Phrases

## One-Line Definitions
"Replication: copying data from a primary database to one or more
replicas that stay in sync with it."
"Read replica: a replica used specifically to serve read traffic so
it doesn't compete with writes on the primary."
"Partitioning: splitting one large table into smaller pieces, still
on a single database instance."
"Sharding: splitting data across multiple separate database
instances, each holding its own slice."

## Sync vs Async Replication
"Sync replication waits for a replica to confirm the write before
acknowledging it — safer, since the replica's guaranteed caught up,
but slower on every write. Async acknowledges immediately and
replicates in the background, which is faster but risks replication
lag — a replica briefly serving stale data."

## Hot Spot / Hot Partition — One-Liner + Example
"A hot spot is a single row, partition, or shard getting
disproportionate traffic compared to the rest of the data — like a
viral post's like-count row being hammered by concurrent writes while
every other post sees normal traffic."

## "How Would You Fix a Hot Partition" — Ready Answer
"A few options depending on the shape of the problem: split a hot
counter into N sharded rows and sum across them to spread write
load, cache the hot row so most reads never hit the database at all,
or batch updates with async aggregation instead of writing on every
single event."

## "When Would You Shard vs Just Add Read Replicas" — Ready Answer
"Read replicas only help if the bottleneck is read traffic — they do
nothing for write throughput, since every replica still receives
every write. If writes themselves are the bottleneck, or a single
table's grown too large for one instance to hold efficiently, that's
when I'd look at partitioning first and sharding only if that's
still not enough."

## One-Liner — Summary
"Scale in order — replicate for reads, partition when a table gets
too large for one instance to handle well, and shard only when
neither of those is enough, because sharding is the one that costs
the most in complexity."
