# Reverse Proxy, Load Balancer & API Gateway

## Forward vs Reverse Proxy

**Forward proxy** — acts on behalf of the *client*. The client
routes its traffic through the proxy before it reaches the internet
(corporate proxy, VPN). The destination server only ever sees the
proxy's IP, never the client's.

**Reverse proxy** — acts on behalf of the *server*. The client
talks to a single address, and the proxy decides which backend
server actually handles the request. The client never sees or knows
about the backends behind it.

The distinction is about whose identity the proxy is hiding —
forward proxy hides the client from the server, reverse proxy hides
the server(s) from the client.

## Load Balancer

### Why It Exists
A single server means: it overloads under real traffic, it's a
single point of failure (it goes down, everything goes down), and
there's no path to handle more load beyond upgrading that one
machine. A load balancer spreads traffic across multiple servers so
the system can scale horizontally and survive individual server failures.

### L4 Load Balancing (Transport Layer)
- Operates on TCP/UDP — sees only IP and port, nothing about HTTP
- Routes per *connection*, not per request — once a connection is
  established, every request on it goes to the same backend for the
  connection's lifetime
- Extremely fast — no need to terminate TLS or parse HTTP, it's
  just forwarding packets based on IP/port
- Works for any protocol, not just HTTP

### L7 Load Balancing (Application Layer)
- Operates on HTTP — sees URL, headers, cookies, method
- Routes per *request* — different requests on the same client
  connection can go to different backends
- Must terminate TLS and parse the HTTP request to make routing
  decisions — meaningfully higher latency and CPU cost than L4
- Enables content-based routing: `/api/*` to one service,
  `/static/*` to a CDN, route by header or cookie

### When to Use Which
- L4 — raw throughput matters, protocol isn't HTTP, or routing
  doesn't need to know anything about request content
- L7 — routing decisions depend on the request itself (path,
  header, method), or you need HTTP-aware features like
  cookie-based session affinity

### Load Balancing Algorithms
- **Round Robin** — cycles through servers in order. Simple, even
  distribution of *request count*, but ignores that some requests
  are far more expensive than others
- **Least Connections** — sends the next request to whichever
  server currently has the fewest active connections. Better than
  round robin when requests have uneven duration/cost — a server
  stuck on a slow request won't keep getting piled on
- **IP Hash** — routes based on a hash of the client IP, giving
  session affinity without a shared session store. Breaks if the
  client's IP changes mid-session (mobile networks, corporate NAT)
- **Weighted** — assigns servers different shares of traffic,
  proportional to their actual capacity — necessary when the fleet
  is heterogeneous (some servers bigger than others)

### Health Checks
The load balancer pings each backend on an interval (HTTP endpoint
or TCP check). A server that fails checks gets pulled out of
rotation immediately, so it stops receiving new traffic while
broken. Once it starts passing checks again, it's automatically
added back in.

## Reverse Proxy
Sits between the load balancer and the application services. Where
the load balancer decides *which server* gets a request, the reverse
proxy decides *how the request is handled* before it reaches the app:

- TLS termination
- HTTP parsing and rewriting (rewriting paths, adding headers)
- Rate limiting
- Request size and time limits
- Caching
- Compression

In practice LB and reverse proxy responsibilities often live in the
same piece of software (nginx, Envoy) — the distinction is about the
*question being answered*, not necessarily two separate boxes.

## API Gateway
A specialized reverse proxy purpose-built for APIs and
microservices. On top of what a reverse proxy already does, it owns:

- Authentication
- Rate limiting per client/API key
- Routing to the correct microservice
- Request validation (schema checks before the request even reaches a service)
- API versioning
- Request/response transformation
- Service discovery (finding which instance of a service to route to)

Why it matters: in a microservices architecture, every one of these
concerns is cross-cutting — every service would otherwise need to
implement its own auth, its own rate limiting, its own validation.
The gateway implements it once, at the edge, so individual services
only deal with their own business logic.

## Load Balancer vs Reverse Proxy vs API Gateway

| | Load Balancer | Reverse Proxy | API Gateway |
|---|---|---|---|
| Primary question | Which server gets this? | How is this request processed before the app sees it? | How is this API request authenticated, validated, and routed? |
| Layer | L4 or L7 | L7 | L7 (API-aware) |
| Typical responsibilities | Distribute traffic, health checks | TLS termination, caching, rate limiting | Auth, routing, validation, versioning, transformation |
| Scope | Any traffic | Any HTTP traffic | Specifically API/microservice traffic |
