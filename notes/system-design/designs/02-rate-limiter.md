# Rate Limiter

## Design:

### Functional requirements:

- Enforce configurable request limit per API key/user
- Potentially per endpoint/tier
- Reject excess requests with HTTP 429
- Global limit across all gateway instances

### Non-Functional Requirements:

- Very low latency
- High availability
- High throughput
- Globally consistent enough per key
- Small overshoot acceptable

### Scale:

Average ≈ 100K req/s
Peak ≈ 500K req/s
→ decision throughput + atomic distributed state is the main challenge, not storage

### Algorithm:

Token Bucket

State per key:

- remainingTokens
- lastRefillTimestamp

capacity = max accumulated burst
refillRate = sustained rate

Example:
capacity = 150
refill = 100/sec

Allows controlled bursts
Long-term rate ≈ 100/sec

### Architecture:

Client
→ Load Balancer
→ Stateless API Gateways
→ Redis Cluster
→ Backend

Redis operation must atomically:

- read bucket
- calculate refill
- check tokens
- decrement
- update state

Use Lua/server-side atomic operation.

### Scaling:

Partition Redis by API key
API key = partition key
hash(API key) → Redis shard

Same key always reaches same shard.
Different keys processed independently.
Gateways do NOT require sticky sessions.

Policy/config is durable and cached locally by gateways.

State is ephemeral; expire inactive bucket entries.

### Failures:

Redis replicas + failover
Rejected requests return 429 Too Many Requests, optionally with Retry-After / limit metadata

Fail closed: protect backend, reduce availability

Fail open: preserve availability, risk overload

Choice is business dependent. For backend-protection requirement → fail closed.

---

## Design walkthrough

- The system enforces configurable per-API-key rate limits globally across all gateway instances. For our example, the policy is 100 requests per second with small bursts allowed.

- Given around 100K average and 500K peak incoming requests per second, rate-limiter decision throughput is the main scaling concern rather than storage. Limiter state itself is small and ephemeral.

- I would use a token-bucket algorithm because it enforces a sustained rate while allowing controlled bursts. For example, a bucket capacity of 150 with a refill rate of 100 tokens/sec allows occasional bursts while maintaining approximately 100 requests/sec over time.

- Requests first reach stateless API gateway instances. Each gateway identifies the API key, obtains the applicable policy from locally cached configuration, and then accesses shared token-bucket state in Redis.

- For every request, the token calculation and decrement must happen atomically. I would implement that as a server-side atomic operation such as a Redis Lua script.

- Since a single Redis node would become a bottleneck around our 500K peak decision rate, I would partition rate-limit state by API key across a Redis cluster. Every request for the same API key maps to the same shard, preserving a single authoritative token bucket while distributing different users across the cluster.

- If a request has tokens available, it proceeds to the backend. Otherwise, we return 429 Too Many Requests, ideally with retry information.

- Redis shards should have replicas for availability. If the rate-limiter backend becomes unavailable entirely, our stated requirement prioritizes protecting downstream services, so I would fail closed for these protected APIs, although that policy can differ for less critical endpoints.
