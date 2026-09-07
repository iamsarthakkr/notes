# NoSQL

## Why NoSQL Exists
Relational databases enforce a fixed schema and strong consistency
guarantees ([[03-transactions-acid]], [[04-isolation-levels-locking]],
[[05-mvcc-deadlocks]]) — exactly right for some workloads, and a poor
fit for others. NoSQL databases trade away some of those guarantees
in exchange for flexibility, horizontal scale, or a better match for
access patterns that don't map cleanly onto tables and joins. Worth
naming and correcting explicitly: "NoSQL is faster" is a myth — it's
not faster in general, it's a different set of tradeoffs that happens
to be faster *for specific access patterns* relational wasn't built
around.

## Key-Value Stores
The simplest model: a key maps to an opaque value. The database
doesn't know or care what's inside the value — no query language into
its structure, lookups are by key only.

**Why**: extremely fast reads and writes (no query planning, no
joins, just a direct key lookup), and trivially shardable — since
every operation is scoped to one key, routing by key across many
nodes is straightforward.

**Use cases**: caching (Redis — teaser here, full coverage in Phase
6), session storage, feature flags — anything that's fundamentally
"give me the value for this key," fast.

**Limitation**: no querying by value content (can't ask "find all
values where X"), no relationships between keys.

## Document Databases
Stores semi-structured documents, usually JSON/BSON. Each document
can have a different shape — there's no schema enforced by the
database itself.

**Why**: a natural fit when data is inherently nested/hierarchical
and usually read and written as one whole unit — e.g. a user profile
with embedded addresses. In a relational model, that same access
pattern needs a join across `users` and `addresses` every time you
just want "the whole profile"; a document database stores it
pre-assembled as it's actually used.

**Reference example**: MongoDB.

**Limitation**: no cross-document joins, or only very limited
support for them — modeling a real relationship between two document
types pushes work back onto the application. No enforced schema also
means the application has to handle documents of inconsistent shape
as the schema evolves over time (old documents don't automatically
gain new fields or get migrated).

## Wide-Column Databases
Rows can have different columns from each other; columns are grouped
into **column families**. Built from the ground up for very large
datasets with query patterns known ahead of time.

**Why**: excellent write throughput and horizontal scale — designed
from the start to distribute across many nodes, unlike a relational
database bolting distribution on afterward.

**Reference example**: Cassandra.

**Use cases**: time-series data, event logging, anything with massive
write volume where the queries that'll be run are known in advance.
That last part is the core limitation: queries have to be designed
into the schema upfront (the table is modeled around exactly how
it'll be queried), unlike relational databases where ad-hoc,
unanticipated queries stay flexible via joins and `WHERE` clauses on
any column.

## Graph Databases
Stores nodes and relationships (edges) as first-class citizens,
optimized specifically for traversing those relationships.

**Why**: relational databases handle deep or recursive relationship
traversal poorly — "friends of friends of friends" means multiple
self-joins, and the cost compounds fast with each additional hop.
Graph databases make exactly this kind of traversal — "friends of
friends," shortest path between two nodes — fast, because the
relationships themselves are stored as direct, traversable
connections rather than reconstructed via joins at query time.

**Reference example**: Neo4j.

**Use cases**: social networks, recommendation engines, fraud
detection (spotting suspicious relationship patterns).

**Limitation**: niche — most systems don't have graph-shaped access
patterns as their *primary* workload. A graph database is usually a
supplementary store for the specific relationship-heavy part of a
system, not the primary database.

## SQL vs NoSQL — Decision Framework
Not a checklist to run through mechanically — a set of questions
about the actual access pattern:
- Need ACID transactions across multiple entities? → relational
- Access pattern is mostly by a single key, and you need to scale
  writes massively? → key-value or wide-column
- Data is naturally document-shaped, read/written as a unit, and the
  schema evolves often? → document
- The core queries are relationship traversal? → graph
- Need ad-hoc queries you can't fully predict in advance? →
  relational — NoSQL generally requires designing your queries into
  the schema upfront, which is the opposite of ad-hoc flexibility

**Polyglot persistence is normal and expected** — a real system
commonly uses a relational database for its core transactional data,
plus one or more NoSQL stores for specific access patterns (Redis for
caching, Elasticsearch for search) rather than trying to force one
database type to handle everything.

## The Core Tradeoff
Every NoSQL type gains something — scale, schema flexibility,
traversal speed — by giving up something a relational database
provides essentially for free: joins, ad-hoc queries, an enforced
schema, transactions spanning multiple entities. Choosing a NoSQL
store should be justified by a specific access pattern that actually
needs what it trades in for, not chosen as a default because it
sounds more scalable.

## Comparison Table

| | Key-Value | Document | Wide-Column | Graph | Relational |
|---|---|---|---|---|---|
| Data model | Key → opaque value | Semi-structured documents (JSON/BSON) | Rows with variable columns, grouped in column families | Nodes + relationships (edges) | Tables, rows, fixed schema |
| Query flexibility | Lookup by key only | Query within a document; limited cross-document | Must be designed upfront, not ad-hoc | Optimized for relationship traversal | Flexible, ad-hoc via joins/WHERE |
| Scaling model | Trivial — shard by key | Horizontal, sharded by document key | Built for horizontal distribution from the start | Usually vertical/less distributed | Vertical first, then replication/partitioning/sharding |
| Consistency guarantees | Usually eventual, varies by store | Usually eventual, varies by store | Usually eventual/tunable | Varies by implementation | Strong (ACID) by default |
| Best-fit use case | Caching, sessions, feature flags | Nested data read/written as a unit, evolving schema | Time-series, event logging, massive write volume | Social graphs, recommendations, fraud detection | Multi-entity transactions, ad-hoc queries, strong consistency needs |
