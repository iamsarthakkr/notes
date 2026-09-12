# Read Scaling — Interview Phrases

## One-Liners
"Read scaling means serving more read requests — usually the first
scaling problem a system hits, since most systems are read-heavy."

## Query Optimization
"Query optimization first: indexing, avoid N+1, paginate, avoid
expensive joins, only read what's needed."

## Read Replicas
"Read replicas: reads from replicas, writes to primary. The tradeoff
is replication lag — eventual consistency for replica reads."
"'Read your own writes' fixes the awkward case of a user not seeing
their own just-written data on a lagging replica."

## Caching
"Caching means storing hot data in-memory. The tradeoff is staleness
and cache invalidation. Good for profiles/posts/feeds, bad for
constantly-changing or sensitive data."

## CDN
"A CDN offloads static assets — images, video, CSS, JS — entirely
away from the app and DB layer."

## Denormalization
"Denormalization trades complex writes for simple, fast reads via a
precomputed schema."
"Feed read problem: don't compute like counts live from the likes
table — maintain a denormalized feed_stats table updated async, and
read counts from there. Trades a little staleness for cheap reads."
