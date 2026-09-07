# TCP vs UDP — Interview Phrases

## Defining TCP
"TCP is connection-oriented — it opens a connection with a 3-way
handshake (SYN, SYN-ACK, ACK) before any data moves. Every byte
gets a sequence number, so the receiver can reorder out-of-order
packets, detect and retransmit lost ones, and drop duplicates."

## Defining UDP
"UDP is connectionless — no handshake, you just send the packet.
It's best-effort: no ordering, no delivery guarantee, no dedup.
If the app needs any of that, it has to build it itself on top."

## Choosing Between Them
"It comes down to whether correctness or speed matters more. If
a dropped or out-of-order packet breaks the application — APIs,
file transfer, DB connections — I use TCP. If a late retransmit
is worse than just losing the packet — live video, gaming, voice —
I use UDP and let the app handle what little reliability it needs."

## HTTP/3 and QUIC
"HTTP/3 moves to UDP via QUIC to get around a TCP problem: head-of-
line blocking, where one lost packet stalls every stream multiplexed
on that connection. QUIC rebuilds reliability and ordering per-stream
in userspace on top of UDP, so one lost packet only blocks its own
stream, not the whole connection."

## One-Liner
"TCP buys you correctness at the cost of a handshake and retransmits;
UDP buys you speed at the cost of building reliability yourself —
pick based on what the application can actually tolerate losing."
