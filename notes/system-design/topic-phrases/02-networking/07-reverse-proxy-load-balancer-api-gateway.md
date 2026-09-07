# Reverse Proxy, Load Balancer & API Gateway — Interview Phrases

## L4 vs L7 — Distinction and When to Use Each
"L4 load balancing works at the TCP level — it only sees IP and
port, routes per connection, and doesn't need to parse HTTP, so it's
very fast but can't make decisions based on request content. L7
terminates TLS and parses the actual HTTP request, so it can route
by path, header, or cookie — more useful, but more expensive per
request. I'd use L4 when I just need raw throughput or the protocol
isn't HTTP, and L7 when routing actually depends on what's in the request."

## Introducing Load Balancing in a Design
"Once a single server becomes a bottleneck or a single point of
failure, I'd put a load balancer in front of multiple instances.
The two things I'd decide right away are the algorithm — round
robin by default, least connections if request cost is uneven — and
whether health checks are pulling failed instances out of rotation
automatically."

## Explaining Algorithm Choice
"Round robin assumes every request costs about the same, which
breaks down if some requests are much heavier than others — a
server can end up with several expensive requests queued while
another sits idle. Least connections fixes that by sending new
traffic to whichever server currently has the fewest active
connections, so slow servers naturally get less new work instead of
more."

## API Gateway vs Reverse Proxy Distinction
"A reverse proxy handles generic HTTP concerns — TLS termination,
caching, rate limiting — for whatever's behind it. An API gateway is
a reverse proxy specialized for APIs: it also owns auth, request
validation, versioning, and routing to specific microservices. Every
API gateway is basically a reverse proxy, but not every reverse
proxy needs to know about auth or service discovery."

## When to Introduce an API Gateway in a Design
"Once there's more than a couple of microservices, I'd introduce a
gateway so auth, rate limiting, and routing are implemented once at
the edge instead of duplicated inside every service. Below that
scale it's often overkill — a plain reverse proxy is enough and
adding a gateway just adds another hop and another thing to operate."

## One-Liners
"Load balancer: which server should handle this connection or request."
"Reverse proxy: how should this request be processed — TLS, caching,
rate limits — before it reaches the app."
"API gateway: a reverse proxy that also owns auth, validation, and
routing for a microservices API surface."
