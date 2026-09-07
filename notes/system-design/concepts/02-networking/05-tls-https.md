# TLS / HTTPS — Encryption & Identity

## What HTTP Lacks
Plain HTTP sends everything in cleartext — anyone on the network
path (a rogue WiFi hotspot, an ISP, a compromised router) can read
or modify the request/response in transit. HTTP also has no way to
verify you're actually talking to the server you think you are —
nothing stops a man-in-the-middle from just answering in its place.

## What TLS Adds
- Encryption — confidentiality; only client and server can read the data
- Integrity — tampering in transit is detectable
- Authentication — the server proves its identity via a certificate
  signed by a trusted Certificate Authority (CA)

## HTTPS = HTTP + TLS
TLS sits between HTTP and TCP — it wraps the connection in
encryption before any HTTP semantics happen on top of it.

```text
HTTP  — request/response semantics
TLS   — encryption, integrity, authentication
TCP   — reliable, ordered delivery
IP    — routes packets, no guarantees
```

## TLS Handshake, Step by Step
1. Client Hello — client sends supported cipher suites + a client
   random value
2. Server Hello — server replies with the chosen cipher suite, a
   server random value, and its TLS certificate
3. Client verifies the certificate — checks the CA's signature
   chain, that the domain matches, and that it hasn't expired
4. Both sides derive a shared symmetric key — using a key exchange
   (e.g. ECDHE) seeded by both random values, without ever sending
   the key itself over the wire
5. Encrypted communication begins — all HTTP traffic from here on
   is encrypted with the shared symmetric key

## TLS Certificate Contents
- Public key — used during the handshake's key exchange
- Domain — the hostname(s) the cert is valid for (CN/SAN)
- CA signature — proof a trusted authority vouched for this domain
  owning this key
- Expiry — validity window; expired certs must be rejected

## Why Asymmetric Then Symmetric
Asymmetric crypto (public/private key) is what makes identity
verification and safe key exchange possible without a shared secret
in advance — but it's computationally expensive. Symmetric crypto is
orders of magnitude cheaper but requires both sides to already share
a key. So TLS uses asymmetric crypto once, briefly, during the
handshake to establish trust and agree on a symmetric key — then
switches to symmetric encryption for the actual bulk data, which is
most of the connection's lifetime.

## TLS Termination at Load Balancer
Pattern: the load balancer holds the TLS certificate, terminates
the encrypted connection there, and forwards plain HTTP to backend
servers over the internal network.

Benefits:
- Certificates managed and rotated in one place, not on every server
- Backend servers skip the handshake's crypto cost entirely
- Simplifies deploying new backend instances — no cert provisioning per node

Tradeoffs:
- Traffic between LB and backend is unencrypted — acceptable inside
  a trusted private network/VPC where you control who's on the wire
- For sensitive data or compliance requirements (PCI, HIPAA), that
  gap isn't acceptable — re-encrypt hop-to-hop (TLS from LB to
  backend too), even though it reintroduces the handshake cost
  you were trying to avoid

## TLS Handshake Cost & Mitigations
A full handshake costs round trips and asymmetric crypto — expensive
if paid on every request. Mitigations:
- Connection reuse (HTTP keep-alive) — pay the handshake once per
  connection, not per request
- Session resumption — session IDs/tickets let a returning client
  skip full renegotiation and reuse a previously established key
- TLS 1.3 — cuts the handshake to 1 round trip (down from 2 in
  TLS 1.2), and supports 0-RTT for resumed sessions, at the cost of
  slightly weaker replay-attack guarantees on that first 0-RTT data
