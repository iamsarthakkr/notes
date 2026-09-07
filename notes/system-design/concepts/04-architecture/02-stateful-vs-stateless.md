# Stateful vs Stateless

## Stateless Systems
A stateless system stores no client-specific data in server memory
between requests. Each request either carries everything needed to
process it, or the server fetches what it needs from an external
store (DB, cache) — nothing about the client is remembered locally on
the server itself.

Why it matters: since no server instance holds request-specific
context that only it knows about, any instance can handle any
request. There's no "this request has to go back to the same server
as last time."

**Advantages**
- Trivial horizontal scaling — add more servers, no coordination
  needed between them
- Simpler load balancing — route to any healthy instance, no session
  affinity required
- Better fault tolerance — if one instance dies, another instance
  picks up the next request with no loss of context

**Example**: a REST API where auth is via a JWT sent on every
request. The token itself carries the identity (see
[[06-cookies-sessions-jwt]]) — the server doesn't need to remember
who's logged in, it just verifies the token on each call.

## Stateful Systems
A stateful system stores information about a specific client across
requests, tied to a particular server instance.

**Examples**: login sessions stored in server memory, shopping carts
held in-process, game state for an active match, an open WebSocket
connection (the connection itself is inherently tied to one server
instance).

Some workloads are intrinsically stateful — real-time multiplayer
games, live collaborative editing, an active WebSocket connection
genuinely need a persistent connection or in-memory state that can't
be trivially reconstructed per-request. This isn't always avoidable;
it's not automatically bad design.

**Disadvantages**
- Harder to scale horizontally — a client's subsequent requests need
  to reach the *same* server that holds their state, or the state
  needs to be shared/replicated across servers
- Harder load balancing — requires session affinity (sticky sessions)
- Worse fault tolerance — if that specific server dies, the in-memory
  state is lost unless it was replicated elsewhere

## The Middle Ground — Externalized State
The common real-world pattern: keep the server itself stateless, but
store the state that would otherwise live in server memory in an
external shared store instead — sessions in Redis, cart contents in
a DB.

Why this is usually the right answer: it gets the scaling and
fault-tolerance benefits of statelessness while still supporting
stateful-feeling features. Any server can handle any request because
it just looks the state up externally instead of holding it locally.

This is why "stateless" doesn't mean "no state exists anywhere in the
system" — it means the *server instance* doesn't hold client-specific
state that only it knows about. The state still exists; it just lives
somewhere shared instead of in one process's memory.

## WebSockets as the Hard Case
An active WebSocket connection is a genuine exception to
externalizing state. The connection is physically tied to the server
instance that accepted it — it can't be trivially externalized the
way session data can, since the TCP connection itself only exists on
that one instance. This has real consequences for load balancing
(covered later as its own topic, not re-explained here).

## The Tradeoff
Stateless is the easier default for scaling and reliability, but
externalizing state isn't free — it adds a network hop on every
request, and a dependency (Redis, the DB) that itself needs to be
available. The goal isn't "always be stateless" — it's "don't hold
state in server memory that could live in a shared external store
instead," while recognizing the small set of cases (like WebSockets)
where that's genuinely hard.

## Comparison Table

| Property | Stateless | Stateful | Externalized State |
|---|---|---|---|
| Scaling ease | Trivial — add instances freely | Hard — client tied to a specific server | Easy — server layer scales freely |
| Load balancing | Any healthy instance | Requires sticky sessions | Any healthy instance |
| Fault tolerance | High — no server holds unique context | Low — server death loses in-memory state | High — state survives in the external store |
| Typical use case | REST API with JWT auth | WebSocket connection, in-memory game state | Sessions in Redis, cart in a DB |
