# Communication Patterns

## Overview
Sync — the caller sends a request and blocks until it gets a
response before doing anything else. Async — the caller doesn't
wait; it either fires and moves on, or gets notified later when
something's ready.

Which pattern makes sense depends on two questions: does the client
need the result immediately to proceed, and does data flow one way
or both ways? Everything below is a different answer to those two
questions.

## Short Polling
Client asks the server "anything new?" on a fixed interval,
regardless of whether anything actually changed.

- Simple — plain HTTP requests, no special infra
- Wastes requests — most polls return "nothing changed"
- Latency is bounded by the poll interval — worst case, an update
  sits unseen for the full interval before the next poll picks it up

Use when: updates are infrequent and simplicity matters more than
efficiency (e.g. checking a background job's status every few seconds).

## Long Polling
Client sends a request; the server holds it open without responding
until new data is available or a timeout is hit. Client immediately
re-opens a new request as soon as the previous one returns.

- Far fewer wasted round trips than short polling
- Much lower latency — the response comes as soon as data exists,
  not on the next scheduled poll
- Costs the server a held-open connection/thread per waiting client
  — doesn't scale as cleanly as a stateless request-response pattern

Use when: near real-time updates are needed but WebSockets aren't
available or are overkill for the traffic volume.

## Server-Sent Events (SSE)
A persistent, one-way HTTP connection where the server pushes events
to the client as they happen. Client opens it by requesting with
`Accept: text/event-stream`; server responds with
`Content-Type: text/event-stream` and keeps the connection open,
writing new events as they occur.

- Simpler than WebSockets — it's just HTTP, no separate protocol
- Browsers auto-reconnect on drop (built into `EventSource`)
- One-way only — server to client, nothing back on the same channel
- Text-based, HTTP-compatible — works through existing proxies/infra
  that already understand HTTP

Use when: live feeds, notifications, dashboards — anything server
push, one direction. Don't use when the client also needs to push
data back on the same connection — that needs WebSockets.

## WebSockets
An HTTP request with an `Upgrade` header switches the connection
from HTTP to a persistent, full-duplex TCP connection. Once
established, either side can send messages independently at any
time — no request/response pairing required.

- Very low latency — no HTTP overhead per message once connected
- True bidirectional — both sides push whenever they want
- The connection is stateful — a given client is pinned to whichever
  server holds its socket, which complicates horizontal scaling (you
  need a pub-sub backplane like Redis to fan messages out across
  servers when a message needs to reach a client connected elsewhere)
- Higher resource usage per connection — an open socket per client,
  even while idle

Use when: chat, gaming, collaborative editing, live prices — genuine
bidirectional, low-latency needs.

## gRPC
An RPC framework built on HTTP/2 and Protocol Buffers. Instead of
hand-rolling REST endpoints, you define a service contract in a
`.proto` file and generate strongly-typed client/server code from it.

```proto
service PaymentService {
  rpc Charge(ChargeRequest) returns (ChargeResponse);
  rpc StreamTransactions(TransactionQuery) returns (stream Transaction);
}
```

Supports four call shapes:
- Unary — one request, one response (like a normal REST call)
- Server streaming — one request, a stream of responses
- Client streaming — a stream of requests, one response
- Bidirectional streaming — both sides stream independently

### REST vs gRPC

| | REST | gRPC |
|---|---|---|
| Payload | JSON (text, human-readable) | Protocol Buffers (binary, compact) |
| Typing | Loose — enforced by convention/docs | Strong — enforced by the `.proto` contract |
| Browser support | Native | Limited (needs grpc-web + a proxy) |
| Streaming | Not native | Native (all four call shapes) |
| Use case | Public APIs, browser clients | Internal service-to-service calls |

Use gRPC for internal microservice communication where you control
both ends and want speed + strict contracts. Avoid it for public
APIs — poor browser support and binary payloads are harder to debug
by hand than JSON.

## HTTP/1.1's Problem
HTTP/1.1 allows only one request in flight per TCP connection at a
time — a slow request blocks everything queued behind it on that
connection (head-of-line blocking at the application layer).
Browsers work around this by opening multiple parallel TCP
connections per host (historically 6) — but each connection pays its
own handshake and TCP slow-start cost, which is wasteful and doesn't
scale past a handful of connections.

## HTTP/2
Multiplexes many requests over a *single* TCP connection — no more
one-request-at-a-time, no more opening 6 parallel connections to
work around it. Also adds:
- Header compression (HPACK) — repeated header data doesn't get
  resent in full on every request
- A binary framing format instead of HTTP/1.1's plain-text protocol

Remaining problem: it's still one TCP stream underneath. If a single
packet is lost, TCP won't deliver *any* buffered data past that
point to the application — even for streams that had nothing to do
with the lost packet. One lost packet blocks every multiplexed
stream (TCP head-of-line blocking, just moved down a layer instead
of solved).

## HTTP/3
Solves HTTP/2's remaining problem by moving off TCP entirely onto
QUIC, which runs over UDP:
- Each multiplexed stream is independent at the transport level — a
  lost packet only stalls the one stream it belonged to, not the
  whole connection
- QUIC combines the transport and TLS handshake into a single round
  trip (vs separate TCP-then-TLS handshakes), so new connections
  start faster
- Connection migration — a connection is identified by a connection
  ID, not an IP/port 4-tuple, so it survives a network change (WiFi
  to cellular) without dropping

Net effect: HTTP/3 is a meaningfully bigger win on mobile and lossy
networks than on a stable wired connection, since that's where
packet loss and network switching actually happen.

## Comparison Table

| Pattern | Direction | Latency | Complexity | Use Case |
|---|---|---|---|---|
| Short Polling | Client → Server (repeated) | High (bounded by interval) | Low | Infrequent updates, simplicity |
| Long Polling | Client → Server (held open) | Medium | Medium | Near real-time, no WebSocket infra |
| SSE | Server → Client only | Low | Low-Medium | Live feeds, notifications, dashboards |
| WebSockets | Bidirectional | Very Low | High | Chat, gaming, collaborative editing |
| gRPC | Bidirectional (streaming) | Very Low | Medium-High | Internal service-to-service calls |
