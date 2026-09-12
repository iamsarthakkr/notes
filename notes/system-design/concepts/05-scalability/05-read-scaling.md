# Read Scaling

## What Read Scaling Is
Read scaling is a system's ability to serve more read requests.

Most consumer systems are read-heavy — think Instagram or YouTube,
where users read far more than they write. Because of this, read
scaling is typically the first major scaling problem a system hits,
well before write scaling becomes relevant.

## Query Optimization
Before reaching for infrastructure, get the query layer right:
- Proper use of indexing
- Avoiding the N+1 query problem
- Proper pagination of large result sets — never return unbounded
  result sets
- Avoiding expensive joins
- Only reading the data actually required — avoid over-fetching

## Read Replicas
The app writes to a primary DB, and reads are served from one or more
replicas (replica 1, 2, 3...). This reduces load on the primary since
it no longer has to serve every read itself.

**Tradeoff — replication lag.** Replicas are slightly behind the
primary, which introduces eventual consistency for reads served from
them: a read immediately after a write can return stale data.

A common mitigation is **"read your own writes"** — route a user's
own subsequent reads to the primary (or wait for replica catch-up)
for some time after they write, so they don't see stale data
reflecting their own action.

## Caching
Store frequently accessed data in-memory for faster access. Instead
of querying the DB on every read, check the cache first.

**Tradeoff.** Caching introduces stale data and a cache invalidation
problem — arguably one of the hardest problems in this space.

Good candidates: profiles, posts, catalogue data, configuration, feed
pages — anything read often and changed relatively infrequently.
Bad candidates: constantly changing data, sensitive data.

## CDN
Serve static resources — images, videos, CSS, JS, PDFs — via a CDN
backed by object storage. This offloads read traffic for static
assets entirely away from the application and DB layer.

## Denormalization
Denormalization helps avoid complex joins and expensive queries by
creating precomputed, read-optimized schema models.

**Tradeoff.** Easier/faster reads in exchange for more complex
writes — the write now has to maintain the precomputed/denormalized
view, e.g. keeping a stats table in sync with the source data.

### Worked Example: The Feed Read Problem
Showing like counts cheaply in a feed is a scaling problem if you
compute them live — scanning the likes table for every feed render is
expensive at scale.

Better: treat the likes table as the source of truth for individual
likes, but maintain a denormalized `feed_stats` table holding
precomputed counts. Flow: a like is saved in the likes table, then a
post-stats counter is updated asynchronously, and the feed reads
directly from the precomputed post-stats — no live calculation.

This is eventually consistent — the count can lag slightly behind the
true total — in exchange for cheap, fast feed reads.

## Applying These Together
Query optimization, read replicas, caching, CDN, and denormalization
are typically applied in roughly this order of effort/impact, but
real systems layer several of them together rather than picking just
one.
