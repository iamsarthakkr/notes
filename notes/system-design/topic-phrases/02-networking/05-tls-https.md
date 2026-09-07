# TLS / HTTPS — Interview Phrases

## Defining HTTPS and What TLS Adds
"HTTPS is just HTTP running over TLS. TLS adds three things plain
HTTP doesn't have: encryption so traffic can't be read in transit,
integrity so tampering is detectable, and authentication so the
client can actually verify it's talking to the real server via a
CA-signed certificate."

## Explaining the TLS Handshake Simply
"The client and server say hello and agree on a cipher suite, the
server sends its certificate, the client verifies it against a
trusted CA and checks the domain and expiry, then both sides derive
a shared symmetric key without ever sending that key over the wire.
Everything after that point — the actual HTTP traffic — is
encrypted with that symmetric key, because symmetric crypto is far
cheaper than asymmetric for bulk data."

## TLS Termination at LB — When and Why
"I'd terminate TLS at the load balancer so certificates live and
rotate in one place instead of on every backend instance, and so
backend servers don't pay the handshake's crypto cost on every
connection. It also makes scaling backend instances simpler — new
nodes don't need their own cert provisioned."

## Tradeoff of TLS Termination
"The cost is that traffic between the LB and backend is unencrypted
plaintext. That's fine inside a private VPC you control, but for
anything compliance-sensitive — PCI, HIPAA — I'd re-encrypt hop-to-
hop from the LB to the backend too, accepting the extra handshake
cost as the price of actually meeting the requirement."

## One-Liner
"TLS is asymmetric crypto once to establish trust and a shared key,
then symmetric crypto for everything after — and terminating it at
the load balancer trades internal encryption for centralized cert
management and cheaper backends."
