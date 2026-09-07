# HTTP — Interview Phrases


## Defining HTTP and Statelessness
"HTTP is a stateless, request-response application protocol — it
defines what a request and response look like, not how the bytes
get there. Stateless means the server doesn't hold session context
between requests; every request has to carry everything it needs."

## Why Statelessness Matters for Scaling
"Because the server holds no per-client state, any instance behind
a load balancer can handle any request — no sticky sessions, no
memory growth tied to connected clients. That's what makes
horizontal scaling straightforward and retries safe: a failed
request can just go to a different server."

## Explaining Idempotency
"An operation is idempotent if running it once has the same effect
as running it N times. GET, PUT, DELETE are idempotent by spec;
POST isn't. It matters most on retries — if a client times out
waiting for a response and retries a non-idempotent POST, like a
payment charge, the server may have already processed the first
one, and now it processes it again."

## Introducing Idempotency Keys in a Design
"For any POST that has a real side effect — payments, order
creation — I'd have the client generate an idempotency key per
logical operation and send it on every attempt. Server checks the
key before processing: if it's seen it before, return the cached
result instead of redoing the side effect. The lookup-and-save has
to be atomic, otherwise two concurrent retries both slip through
before either one commits."

## One-Liner
"HTTP is stateless by design so any server can handle any request —
the tradeoff is that anything with a side effect, like a POST,
needs its own idempotency story or retries will duplicate work."
