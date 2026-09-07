# Capacity Estimation

## What It Is
Estimating how many resources your system will need before designing it.
Capacity planning drives architecture — not the other way around.

For 50 req/sec: no sharding, no distributed systems needed.
For 50M req/sec: entirely different architecture.

We care about order of magnitude, not exact numbers.
48,730 req/sec ≈ 50,000 req/sec — close enough.

## What To Estimate

### 1. Users
- Daily Active Users (DAU)
- Monthly Active Users (MAU)  
- Concurrent users (usually 10-20% of DAU)
- Peak vs average (must survive peak)

### 2. Requests Per Second (RPS)
- Average RPS = DAU × requests per user per day / 86,400
- Peak RPS = average × peak multiplier (usually 2-5x)

### 3. Storage
- Per record size × records per day × retention period
- Separate: hot storage (recent) vs cold storage (archival)

### 4. Bandwidth
- RPS × average response size
- Separate read bandwidth from write bandwidth

### 5. Database
- As load increases → may need partitioning, archiving, sharding
- Estimate when DB becomes the bottleneck

## Worked Example — Instagram-like System

**Assumptions:**
- 500M DAU
- Each user views 20 posts/day, creates 1 post/day
- Average photo size: 1MB
- Average post metadata: 1KB

**RPS:**
- Read: 500M × 20 / 86,400 ≈ 115,000 reads/sec (~115K RPS)
- Write: 500M × 1 / 86,400 ≈ 5,800 writes/sec (~6K RPS)
- Peak read: ~300K RPS (assume 2.5x multiplier)

**Storage (per day):**
- Photos: 500M × 1MB = 500TB/day
- Metadata: 500M × 1KB = 500GB/day

**Bandwidth:**
- Read: 115K × 1MB = 115GB/sec (for photos via CDN)
- Write: 6K × 1MB = 6GB/sec

**What this tells us:**
- Read-heavy system (20:1 read/write ratio) → read replicas, caching, CDN
- 500TB/day storage → object storage (S3), not DB
- 300K peak RPS → horizontal scaling, load balancer
- 6K writes/sec → single primary DB can handle this initially

## Bottleneck Types + Fixes

| Bottleneck | Symptoms | Fix |
|---|---|---|
| CPU | High compute, slow processing | Optimize code, background jobs, caching computed results |
| Memory | Memory leaks, large objects, unbounded queues | Streaming, pagination, cache limits |
| DB/IO | Missing indexes, N+1, inefficient queries | Indexes, read replicas, caching, sharding |
| Disk/IO | Many random reads, large scans, slow storage | Object storage, CDN, batch writes |
| Lock contention | Heavy concurrent access to same resource | Sharded counters, async aggregation |
| Network | Too many service calls, large payloads | Batch requests, compression |

## Interview Approach
1. Ask clarifying questions to get user numbers
2. Calculate RPS (read and write separately)
3. Calculate storage needs
4. Identify which number is the constraint
5. Let that drive your architecture decisions

Never jump to architecture before doing this — it shows you 
design based on actual scale, not assumptions.
