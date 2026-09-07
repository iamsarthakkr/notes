# HTTP Methods & Status Codes

## HTTP Methods

| Method | Action | Idempotent | Has Body |
|---|---|---|---|
| GET | Read a resource | Yes | No |
| POST | Create a resource / trigger an action | No | Yes |
| PUT | Replace a resource entirely | Yes | Yes |
| PATCH | Partially update a resource | No | Yes |
| DELETE | Remove a resource | Yes | No (usually) |

## Key Distinctions

**PUT vs PATCH** — PUT replaces the whole resource with what you
send; anything you omit is gone. PATCH sends only the delta —
"change these fields" — and leaves the rest untouched.

**POST vs PUT** — POST is for when the server decides the outcome
(new ID, computed result) — you don't know the final URI up front.
PUT is for when the client already knows the exact resource URI and
is replacing it wholesale, idempotently.

**GET vs POST** — GET is a safe read with no side effects; POST is
a write with side effects. This distinction is what caching, CDNs,
and browser prefetching all rely on.

## Idempotency Per Method — Why
- GET — idempotent because reading doesn't change anything
- PUT — idempotent because "replace with X" run twice still leaves
  the resource as X
- DELETE — idempotent because "make sure this doesn't exist" run
  twice still leaves it not existing (the second call is a no-op,
  even if it returns 404 instead of 200)
- POST — not idempotent because each call typically creates a new
  resource — call it twice, get two resources
- PATCH — not idempotent when the update is a delta rather than a
  set. `PATCH {"count": count+1}` run twice increments twice. (A
  PATCH that sets an absolute value, e.g. `{"status": "shipped"}`,
  is idempotent in practice — idempotency is about the semantics
  of the specific update, not a hard guarantee of the method)

## Infra Implications
- GET — cacheable by default (CDNs, browsers, reverse proxies)
- POST — never cached by default, since it has side effects and no
  two POSTs are assumed equivalent
- DELETE — safe to blindly retry on timeout, since the end state
  after N deletes is identical to after 1

## Status Codes

**2xx — Success**
- 200 OK — generic success, response has a body
- 201 Created — resource created, usually with a `Location` header
  pointing at the new resource
- 204 No Content — success, but nothing to return (common for
  DELETE or PUT with no response body)

**3xx — Redirection**
- 301 Moved Permanently — resource has a new URI, update bookmarks/links
- 302 Found — temporary redirect, keep using the original URI next time

**4xx — Client Error**
- 400 Bad Request — malformed request (bad JSON, missing required field)
- 401 Unauthorized — not authenticated (no or invalid credentials)
- 403 Forbidden — authenticated, but not allowed to do this
- 404 Not Found — resource doesn't exist (or hidden for security reasons)
- 409 Conflict — request conflicts with current server state
  (e.g. version mismatch, duplicate unique key)
- 422 Unprocessable Entity — well-formed request, but semantically
  invalid (e.g. end date before start date)
- 429 Too Many Requests — rate limited, often paired with a
  `Retry-After` header

**5xx — Server Error**
- 500 Internal Server Error — unhandled exception, generic catch-all
- 502 Bad Gateway — upstream server returned an invalid response
- 503 Service Unavailable — server is deliberately not handling
  requests right now (overloaded, maintenance)
- 504 Gateway Timeout — upstream server didn't respond in time

## Key Distinctions

**401 vs 403** — 401 means "I don't know who you are" (missing or
invalid credentials — retry with auth). 403 means "I know who you
are, and you're not allowed" (retrying with the same credentials
won't help; you'd need different permissions).

**502 vs 503 vs 504** — all three mean "something's wrong upstream,"
but the cause differs:
- 502 — upstream responded, but with garbage (crashed mid-response,
  malformed output)
- 503 — upstream is intentionally not serving traffic right now
  (health check failing, graceful shutdown, overloaded and shedding load)
- 504 — upstream never responded within the timeout window (slow
  query, deadlock, network partition)

**409 vs 422** — 409 is about *state*: the request is fine on its
own, but conflicts with what's currently stored (two clients editing
the same record, a unique constraint violation). 422 is about the
*payload itself*: it's semantically invalid regardless of current
state (negative price, end date before start date).

**429 and Retry-After** — 429 tells the client to slow down; the
`Retry-After` header (seconds or a timestamp) tells it exactly when
to try again instead of guessing with arbitrary backoff. Clients
that ignore `Retry-After` and hammer immediately defeat the point of
rate limiting.
