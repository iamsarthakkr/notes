# TCP vs UDP — Transport Protocols

## What They Are
IP only moves packets from one machine to another — no guarantee
of order, delivery, or duplicate prevention. TCP and UDP sit on
top of IP and decide what guarantees (if any) the application gets.

- TCP — connection-oriented, reliable, ordered
- UDP — connectionless, best-effort, unordered

Core question: "Does my application need correctness guarantees,
or can it move faster without them?"

## TCP 3-Way Handshake
Before any data flows, client and server sync on sequence numbers:

```
Client                  Server
  | ---- SYN (seq=x) ----> |     "I want to talk, my seq starts at x"
  | <-- SYN-ACK (seq=y,   |     "OK, ack x+1, my seq starts at y"
  |      ack=x+1) ------- |
  | ---- ACK (ack=y+1) --> |     "Got it, connection open"
```

Connection is established only after all 3 steps complete.

## Why Sequence Numbers Matter
The internet doesn't guarantee packets arrive in the order sent —
they can take different routes and arrive out of order, get
dropped, or get duplicated by retries. Sequence numbers let TCP:

- Reorder — reassemble packets in the order they were sent
- Retransmit — detect a missing seq number and resend it
- Deduplicate — recognize a seq number already received and drop the repeat

Without sequence numbers, the app layer would have to solve all
of this itself — which is exactly what UDP-based protocols do.

## TCP Failure Scenarios
- SYN lost — client gets no SYN-ACK, retries after timeout (backoff)
- Server down — nothing responds, client eventually times out
- Port closed — server host is up but nothing's listening, OS
  replies with RST (connection refused), fails fast instead of timing out

## When to Use TCP
- Correctness matters more than latency
- Ordered delivery is required
- HTTP/APIs, file transfer, database connections — anything where
  a dropped or reordered byte breaks the application

## UDP Characteristics
- Connectionless — no handshake, just send the packet
- Best-effort — no delivery guarantee, no ordering, no dedup
- App controls retry — if you need reliability, you build it
  yourself on top (or accept the loss)

## When to Use UDP
- Speed matters more than perfect delivery
- Streaming, gaming — a dropped frame is cheaper than waiting for
  a retransmit that arrives too late to matter
- DNS — small, single-round-trip queries where TCP's handshake
  overhead isn't worth it

## TCP vs UDP Comparison

| | TCP | UDP |
|---|---|---|
| Connection | Handshake required | None |
| Ordering | Guaranteed | Not guaranteed |
| Reliability | Retransmits lost packets | None (app's job) |
| Speed | Slower (overhead) | Faster |
| Use case | HTTP, APIs, files, DB | DNS, streaming, gaming |

## Connected To
- 03-http.md
- 05-tls-https.md
- 08-communication-patterns.md
