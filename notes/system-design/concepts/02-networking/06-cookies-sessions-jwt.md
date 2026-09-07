# Cookies, Sessions & JWT — Auth State

## Cookies

### What They Are
Small key/value data the browser stores and automatically attaches
to every request that matches the cookie's domain/path. The
application doesn't have to manually resend them — the browser does
it for you.

### How Servers Set Them
The `Set-Cookie` response header:

```http
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax
```

### Cookie Flags
- `HttpOnly` — JavaScript can't read the cookie via `document.cookie`.
  Blunts XSS: even if an attacker injects a script, it can't exfiltrate
  the session cookie
- `Secure` — cookie is only sent over HTTPS, never plain HTTP
- `SameSite` — controls whether the cookie is sent on cross-site
  requests (CSRF mitigation):
  - `Strict` — never sent cross-site, even on top-level navigation
  - `Lax` — sent on top-level navigation (clicking a link) but not
    on cross-site subrequests (forms, fetch from another site) — the default in modern browsers
  - `None` — sent on all cross-site requests, requires `Secure`

### Use Cases
Session IDs, user preferences, cart contents — anything small that
should ride along automatically with every request to that domain.

## Sessions

### What They Are
The actual state (who's logged in, what's in their cart) lives on
the server. The client only holds an opaque session ID — a
reference, not the data itself.

### Flow
1. User logs in
2. Server creates a session record (in memory or a store) and
   generates a session ID
3. Server sends the session ID via `Set-Cookie`
4. Client's browser auto-sends that cookie with every subsequent request
5. Server looks up the session by ID on each request to know who's calling

### The Multi-Server Problem
Session gets created on Server A (in-memory). Load balancer routes
the client's next request to Server B — which has never heard of
that session ID. The user appears logged out.

### Solution 1: Sticky Sessions
Load balancer always routes a given client to the same server
(based on session ID or IP).
- Problem: if that server crashes, every session it held is gone
- Problem: uneven load — some servers accumulate more "sticky"
  clients than others, defeating the point of load balancing

### Solution 2: Shared Session Store (Redis)
Session data lives in Redis, not in any one server's memory. Any
server can look up any session ID.
- Fast lookup (Redis is built for this)
- Scales horizontally — servers stay interchangeable, no stickiness needed
- Survives individual server restarts — the session outlives the process

## JWT (JSON Web Token)

### What It Is
A signed string that encodes claims about the user directly in the
token — the server doesn't need to remember anything, because the
proof of identity travels with the request itself.

### Structure
```
HEADER.PAYLOAD.SIGNATURE
```
- Header — algorithm and token type (e.g. `{"alg":"HS256","typ":"JWT"}`)
- Payload — claims: user id, roles, expiry (`exp`), issued-at (`iat`)
- Signature — HMAC/RSA signature over header+payload, proves the
  token wasn't tampered with since the server issued it

### How It Works
1. User logs in
2. Server signs a JWT containing the user's claims
3. Client stores it (cookie or local storage) and sends it as
   `Authorization: Bearer <token>` on every request
4. Server verifies the signature and reads the claims directly —
   no database lookup required to know who's calling

### Key Properties
- Stateless — server holds nothing between requests; the token
  itself is the proof
- The payload is base64-encoded and **signed, not encrypted** —
  anyone who intercepts the token can read the claims in plain text.
  Never put a password, secret, or anything sensitive in the payload
- The signature guarantees the payload wasn't altered — it does not
  guarantee confidentiality

### JWT Revocation Strategies
Statelessness is the whole appeal of JWT, but it's also what makes
revocation hard — there's no server-side record to delete. Options,
in order of how much you give back:

1. **Short expiry + refresh tokens** — access token expires in ~15
   minutes, a longer-lived refresh token (~7 days) is stored
   server-side (Redis). Revoke by deleting the refresh token; the
   access token dies naturally within 15 minutes anyway
2. **Token blacklist in Redis** — include a unique `jti` (JWT ID)
   claim per token, check it against a Redis blacklist on every
   request. Works, but reintroduces a lookup per request — you've
   partially rebuilt the thing statelessness was supposed to avoid
3. **Rotate the signing key** — every existing token instantly fails
   signature verification. The nuclear option: logs out every user
   simultaneously, reserved for actual key compromise or incident response

### Session vs JWT

| | Session | JWT |
|---|---|---|
| State location | Server (memory/Redis) | Client (in the token) |
| Scaling | Needs sticky sessions or shared store | Naturally stateless |
| Revocation | Instant (delete the record) | Hard — needs refresh tokens or a blacklist |
| Per-request cost | DB/Redis lookup | Signature verification (cheap, no lookup) |
| Payload exposure | Nothing exposed to client | Claims readable by anyone with the token |
