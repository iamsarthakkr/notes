# URL Shortener

## Design:

### Functional requirements:

- Create short unique alias for URL
- Redirect short alias → long URL

### Non-Functional Requirements:

- High availability
- Very low redirect latency
- Durable mappings
- Scalable

### Scale:

100M creations/month ≈ 40 writes/s
100:1 redirect/write ≈ 4K reads/s
→ strongly read-heavy

### API:

POST /api/short-urls
GET /{shortCode}

### Data model:

short_code PK
long_url
created_at

### Short-code generation:

Unique numeric ID → Base62
62^7 ≈ 3.5T combinations
DB sequence sufficient initially
distributed ID generation only if needed later

### Redirect:

Redis cache-aside `shortCode → longURL`
miss → DB → populate cache
LFU useful for hot URLs
long TTL + jitter
negative caching for invalid keys
request coalescing / distributed lock for stampede

### DB:

Primary-key lookup
SQL fine initially
read replicas as traffic grows
partition/shard by short_code when required

### Failures:

App instance failure → LB routes elsewhere
Redis failure → DB fallback
DB failure → cached redirects can continue

---

## Design walkthrough

- The service has two main operations: create a short URL and redirect an existing short URL. I'll optimize primarily for availability and low redirect latency.

- At roughly 100M creations per month and 100 times more redirects, we're looking at around 40 average writes/sec and 4K redirects/sec, making this heavily read-oriented.

- I'll expose a POST endpoint for URL creation and a GET endpoint using the short code.

- The main record consists of short_code, long_url, and metadata such as creation time.

- Application servers are stateless behind a load balancer. For URL creation, I'd initially use a database-generated unique numeric ID and Base62-encode it into a compact short code. This avoids collisions entirely at our current write throughput.

- For redirects, I'd use Redis with a cache-aside strategy storing shortCode -> longURL. A cache hit immediately returns the redirect; a miss queries the persistent database and populates Redis.

- I'd use a long TTL because mappings are immutable, LFU eviction for popular links, and short-lived negative caching for invalid codes.

- If hot URLs cause cache stampedes, request coalescing or a short distributed lock can ensure only one request rebuilds a missing entry.

- The persistent database can initially be relational because the workload is modest and primary-key lookups are efficient. As scale grows, we can add replicas and eventually partition using short_code as the shard key. At very large scale, a distributed key-value store may become a natural alternative.

- The service remains available across application-server failures because instances are stateless. Redis failures degrade us to DB reads rather than causing redirects to fail.”
