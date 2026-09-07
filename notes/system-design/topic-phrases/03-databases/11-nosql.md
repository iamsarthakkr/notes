# NoSQL — Interview Phrases

## One-Line Definitions
"Key-value: a key maps to an opaque value, lookups by key only, no
querying into the value's structure."
"Document: stores semi-structured documents, usually JSON, where
each document can have a different shape and there's no enforced schema."
"Wide-column: rows with variable columns grouped into column
families, built for massive write volume across many nodes."
"Graph database: nodes and relationships stored as first-class
citizens, optimized for traversal instead of joins."

## "NoSQL Isn't Just Faster" — Correction
"NoSQL isn't faster in general — it trades away things relational
gives you for free, like joins, ad-hoc queries, and multi-entity
transactions, in exchange for scale or flexibility on a specific
access pattern. It's faster only for the access pattern it was
actually built around."

## "When Would You Reach for NoSQL Over Relational" — Ready Answer
"It comes down to the access pattern, not a general preference — if
I need ACID across multiple entities or ad-hoc queries I can't
predict in advance, that's relational. If access is mostly by a
single key and I need to scale writes hard, that's key-value or
wide-column. If the data is naturally document-shaped and the schema
evolves often, that's document. I wouldn't default to NoSQL without
one of those specific needs driving it."

## Polyglot Persistence — One-Liner + Example
"Polyglot persistence means using different databases for different
access patterns in the same system, instead of forcing one database
type to do everything — like relational for core transactional data
plus Redis for caching and Elasticsearch for search."

## One-Liner — Summary
"Pick NoSQL for a specific access pattern, not as a default — most
real systems are relational at the core with one or two NoSQL stores
layered in for the parts that actually need them."
