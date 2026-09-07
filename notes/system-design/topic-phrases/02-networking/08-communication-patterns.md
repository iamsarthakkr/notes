# Communication Patterns — Interview Phrases

## Choosing Between Polling, SSE, and WebSockets
"It comes down to how often data changes and whether the client
needs to push data back. Infrequent updates where simplicity is fine
— short polling. Need near-real-time without WebSocket
infrastructure — long polling. Frequent one-way server push, like a
live feed or notifications — SSE. Genuine bidirectional, low-latency
needs, like chat or collaborative editing — WebSockets."

## Introducing WebSockets in a Real-Time Design
"For a chat or live-collaboration feature I'd upgrade to a
WebSocket connection per client instead of polling. The catch is the
connection is stateful and pinned to whichever server accepted it,
so if a message needs to reach a client connected to a different
server, I'd need a pub-sub backplane — Redis or similar — to fan the
message out across instances."

## Why gRPC Over REST for Internal Services
"Between internal services I'd lean gRPC — it gives strongly-typed
contracts via the .proto file so both sides can't silently drift out
of sync, and it runs on HTTP/2 so it's faster over the wire than
JSON over HTTP/1.1. I wouldn't expose it publicly though — browser
support is weak and binary payloads are painful to debug compared to JSON."

## HTTP/2 Multiplexing Benefit
"HTTP/2 lets many requests share a single TCP connection instead of
opening several connections per host, which cuts out redundant
handshake and slow-start overhead."

## HTTP/3 and QUIC
"HTTP/3 moves off TCP onto QUIC over UDP so a single lost packet
only stalls the one stream it belongs to instead of blocking every
multiplexed request on the connection, and connections survive a
network switch since they're identified by a connection ID instead
of an IP/port tuple."

## One-Liners
"Short polling: simple, but you're paying for requests that mostly
say nothing changed."
"Long polling: the server holds the line open so the answer arrives
the moment there's one, at the cost of a held connection per client."
"SSE: one-way server push over plain HTTP, with reconnection built in for free."
"WebSockets: true bidirectional and low-latency, but the connection
is stateful and that has to be designed around."
"gRPC: strict typed contracts and HTTP/2 performance for
service-to-service calls, not for the public internet."
