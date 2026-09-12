# Common Bottlenecks and Fixes

[[03-scalability-bottlenecks]] establishes that a system is only as
fast as its slowest component — this note is the practical follow-up:
six concrete categories to check when diagnosing "the system is
slow."

## CPU Bottleneck
**Causes**
- Heavy computations
- Serialization/deserialization overhead
- Bad algorithms
- Too many threads — context-switching overhead eats into actual work

**Fixes**
- Optimize code/algorithms
- Add CPU cores
- Push heavy work to background jobs instead of the request path
- Cache computed results instead of recomputing them

## Memory Bottleneck
**Causes**
- Large in-memory objects
- Memory leaks
- Loading too much data at once
- Unbounded queues/caches that grow without limit

**Fixes**
- Stream data instead of loading it all at once
- Paginate large result sets
- Profile memory usage to find leaks
- Enforce cache size limits

## Database Bottleneck
**Causes**
- Missing indexes
- Inefficient queries
- The N+1 query problem
- Too many writes
- Poor schema design

**Fixes**
- Add indexes
- Read replicas
- Caching
- Sharding

Read/write scaling and partitioning — later topics in this phase —
are the deep-dive versions of these DB fixes, not separate concerns.

## Disk/IO Bottleneck
**Causes**
- Many random reads
- Slow storage medium
- Large scans

**Fixes**
- Use object storage for large/infrequently-accessed data
- Serve static resources via a CDN
- Batch writes instead of many small ones

## Lock Contention Bottleneck
**Causes**
- Heavy concurrent access to the same resource — e.g. many writers
  updating one row/counter

**Fixes**
- Sharded counters — spread writes across multiple sub-counters
- Async aggregation — don't update the hot resource synchronously on
  every request

## Network Bottleneck
**Causes**
- Too many service-to-service calls
- Large payloads
- Missing compression

**Fixes**
- Batch requests together
- Serve via CDN
- Enable compression

## Using This as a Checklist
These six categories are the standard checklist to run through when
diagnosing "the system is slow." Match the symptom to the category
before reaching for a fix — the fix for one (e.g. more CPU cores)
does nothing for another (e.g. lock contention).
