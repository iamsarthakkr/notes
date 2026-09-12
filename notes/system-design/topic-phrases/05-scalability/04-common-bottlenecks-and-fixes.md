# Common Bottlenecks and Fixes — Interview Phrases

## The Six Categories
"CPU bottleneck: heavy computation, bad algorithms, too many threads.
Fix: optimize, add cores, push to background jobs, cache results."
"Memory bottleneck: large objects, leaks, unbounded caches. Fix:
stream, paginate, profile, cap cache size."
"DB bottleneck: missing indexes, N+1 queries, poor schema. Fix:
indexes, replicas, caching, sharding."
"Disk/IO bottleneck: random reads, slow storage, large scans. Fix:
object storage, CDN, batch writes."
"Lock contention: many writers on one resource. Fix: sharded
counters, async aggregation."
"Network bottleneck: too many calls, large payloads, no compression.
Fix: batching, CDN, compression."

## Closing Summary
"Six-category checklist for 'system is slow': CPU, memory, DB,
disk/IO, lock contention, network — match symptom to category before
picking a fix."
