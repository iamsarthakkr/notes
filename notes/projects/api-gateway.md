# API Gateway System

## Project Snapshot

**One-line pitch:** A reactive API gateway built from scratch on Spring
WebFlux — dynamically routes and reverse-proxies requests to downstream
services based on YAML config, handling header propagation, request
tracing, and failure cases the way a real gateway has to.

**Tech stack:**

| Layer | Choice | Why |
|---|---|---|
| Language | Java 21 | Modern LTS, consistent with the rest of the stack |
| Framework | Spring Boot + Spring WebFlux | A gateway is I/O-bound by nature (mostly waiting on downstream calls) — reactive/non-blocking is the correct model, not just a resume line |
| HTTP client | WebClient (Reactor) | Non-blocking downstream calls that compose naturally with WebFlux's reactive pipeline |
| Build | Maven, multi-module | Gateway and fake downstream services are independently deployable/runnable, mirroring a real microservices setup |
| Config | `@ConfigurationProperties` | Type-safe route config instead of manually parsing values — catches config errors at startup, not at request time |
| Testing | MockWebServer | Lets tests assert on real HTTP traffic (headers, body, status codes) without depending on live services |

**Structure:** Maven multi-module — `api-gateway` (the gateway itself),
`faker-user-service`, `faker-product-service` (stand-in downstream services
used to exercise routing end-to-end in tests and locally).

**Key architecture decisions:**

- **Built the reverse proxy from scratch instead of using Spring Cloud
  Gateway.** This is the single most important framing decision for this
  project — see "Why build from scratch" below.
- **Filter chain design**: `Client → Logging Filter → Request ID Filter →
  Route Validation Filter → Proxy Controller → Proxy Service → WebClient →
  Downstream Service`. Each filter has one job (logging, tracing, validation),
  so cross-cutting concerns don't bleed into the actual proxying logic.
- **Dynamic routing via YAML config** rather than hardcoded route mappings —
  adding a new downstream service means adding config, not redeploying code.
- **Migrated config loading from a hand-rolled `ConfigService` to
  `@ConfigurationProperties`** — a real decision made mid-project once the
  manual approach started feeling fragile; worth mentioning as an example of
  recognizing and fixing your own technical debt.

## Technical Depth

**Why building from scratch instead of Spring Cloud Gateway is the strongest
talking point here:** This wasn't "reinventing the wheel" for its own sake —
it was a deliberate choice to learn what a gateway actually *does* under the
hood before relying on a framework that does it for you. Using Spring Cloud
Gateway would have gotten routing "for free" but would have skipped exactly
the parts that are valuable to understand deeply: how hop-by-hop headers work,
what a reverse proxy has to strip and preserve, how to propagate a request
correctly across process boundaries, and how reactive backpressure actually
behaves under a real request load. Frame it explicitly as: *"I know how to
use Spring Cloud Gateway; I chose not to for this project because I wanted
to understand the mechanics it hides."* That's a much stronger answer than
either extreme (blindly using the framework, or not knowing the framework exists).

**Reactive programming with WebFlux — how to explain it simply:**
- Traditional Spring MVC is one-thread-per-request: a thread blocks while
  waiting for the downstream call to return. That doesn't scale well for a
  gateway, where *every* request means waiting on another network call.
- WebFlux uses a small number of event-loop threads. A request comes in, the
  call to the downstream service is issued asynchronously, and the thread is
  freed to handle other requests while waiting — when the downstream response
  arrives, processing resumes.
- **The one-sentence version for an interview:** "A gateway spends almost all
  its time waiting on network I/O, not computing — WebFlux means those waits
  don't block a thread, so a handful of threads can handle far more concurrent
  requests than a blocking model would let you with the same resources."
- Be ready for a follow-up on backpressure: Reactor's `Mono`/`Flux` propagate
  demand upstream, so a slow downstream service or slow client naturally
  applies backpressure instead of the gateway buffering unbounded requests in memory.

**HTTP internals demonstrated by this project:**
- **Hop-by-hop header removal** — headers like `Connection`, `Keep-Alive`,
  `Transfer-Encoding` are per-connection and must not be blindly forwarded to
  the downstream service or back to the client; only end-to-end headers should
  pass through.
- **Status code and body preservation** — the proxy has to transparently pass
  through whatever the downstream service returns (2xx, 4xx, 5xx, arbitrary
  bodies) rather than normalizing/hiding it.
- **502 on downstream failure** vs. propagating the downstream's own error
  status — the gateway distinguishes "downstream returned an error" (pass it
  through) from "downstream is unreachable" (502, the gateway's own fault
  signal).
- **`X-Request-ID` generation** for request tracing across the gateway →
  downstream hop — foundational building block for distributed tracing later.

**The request pipeline and filter chain — how to whiteboard this:**
```
Client
  │
  ▼
Logging Filter          (logs method, path, timing)
  │
  ▼
Request ID Filter        (generates/propagates X-Request-ID)
  │
  ▼
Route Validation Filter  (checks route exists in config → 404 if not)
  │
  ▼
Proxy Controller          (entry point for valid routes)
  │
  ▼
Proxy Service             (builds outbound request: headers, query, body)
  │
  ▼
WebClient  ──────────►  Downstream Service
  │
  ▼ (response flows back up through the same chain)
Client
```
Draw it as a straight pipeline, left to right or top to bottom — the point to
make out loud is that each filter is single-responsibility and the chain is
ordered deliberately (you validate the route *before* you do the expensive
work of proxying it).

**Testing approach:**
- **MockWebServer** stands in for downstream services, so tests assert on
  real HTTP semantics — route matching, path forwarding, query parameter
  passthrough, request body forwarding, header propagation *and* header
  removal, all HTTP methods (GET/POST/PUT/PATCH/DELETE), and downstream
  failure handling (timeouts, connection errors → 502).
- Why MockWebServer over mocking `WebClient` directly: mocking `WebClient`
  verifies your code calls the client correctly; MockWebServer verifies the
  actual bytes on the wire are correct — headers really are stripped, the
  body really is forwarded unmodified. That distinction matters a lot for a
  proxy, where "the code compiles and calls the right method" and "the HTTP
  semantics are actually correct" are not the same thing.

## Self-Awareness

**What I'd do differently now:**
- Build the Auth Filter and rate limiting earlier rather than last — a
  gateway without auth is a toy; I sequenced "get proxying correct" first,
  which was the right call for learning HTTP internals, but in a real system
  I'd want auth in the pipeline from day one.
- Extract common filter logic (e.g. request/response logging boilerplate)
  into a shared filter base once the filter count grew — didn't feel the
  pain until a few filters in.

**Known limitations / honest tradeoffs:**
- No auth/JWT validation yet — anyone who can reach the gateway can reach
  any configured downstream route. Explicitly listed as planned, not shipped.
- No rate limiting, retry, or circuit breaker — a downstream service being
  slow or down currently just means every request to it fails/times out
  individually; there's no protection against cascading failure yet.
- Static YAML-based routing, not dynamic service discovery — adding a route
  means editing config and restarting, not automatic registration.
- No distributed tracing/metrics beyond the `X-Request-ID` — the ID is
  generated and propagated, but there's no collector/dashboard wired up yet.

## Interview Prep

**Q: Why didn't you just use Spring Cloud Gateway?**
A: I wanted to understand what a gateway actually does — header handling,
reverse proxy mechanics, reactive request handling — rather than get that for
free from a framework. It was a deliberate learning choice, not a rejection
of the tool; I'd use Spring Cloud Gateway (or this) depending on the project's
actual constraints.

**Q: Why WebFlux instead of standard Spring MVC?**
A: A gateway is almost pure I/O wait — every request is waiting on a
downstream call. WebFlux's non-blocking model means a small thread pool can
handle far more concurrent in-flight requests than a blocking, one-thread-per-request model.

**Q: Walk me through what happens to a request end-to-end.**
A: [see pipeline diagram above] — logging → request ID → route validation →
proxy controller → proxy service builds and sends the outbound request via
WebClient → response flows back through the chain to the client.

**Q: How do you handle a downstream service being down?**
A: The gateway returns a 502 — distinguishing "the downstream responded with
an error" (which gets passed through as-is) from "the downstream was
unreachable" (which is the gateway's own failure signal). Circuit breaking to
stop hammering a known-down service is planned but not yet implemented.

**Q: What are hop-by-hop headers and why do they matter here?**
A: Headers like `Connection` and `Transfer-Encoding` describe the specific
TCP connection, not the actual message — forwarding them to the downstream
service (or back to the client) as-is can break the connection or misrepresent
the message framing. A correct proxy strips them and only forwards end-to-end headers.

**Q: How did you test this without real downstream services?**
A: MockWebServer — it lets me assert on the actual outbound HTTP request
(headers, body, method) and control the response, so tests validate real
wire-level behavior instead of just "did my code call the right method."

**Q: What's missing before this could go to production?**
A: Auth/JWT validation, rate limiting, circuit breaking and retries, and
proper observability (metrics + distributed tracing beyond just the request
ID) — all explicitly scoped as "planned, not built" rather than something I
missed.

**Q: Why did you move from a custom `ConfigService` to `@ConfigurationProperties`?**
A: The hand-rolled version worked but wasn't type-safe — config errors would
only surface at request time. `@ConfigurationProperties` catches binding
errors at startup, which is a much better failure mode for something as
foundational as routing config.

**Q: How would you add rate limiting to this?**
A: As another filter in the chain, placed after route validation but before
the proxy service — likely token bucket, since it handles bursty traffic
better than a fixed window while still being simple to reason about and cheap to check per request.

**Q: What did building the filter chain teach you about middleware design?**
A: Ordering matters and each filter should do exactly one thing — validating
the route before doing the (relatively expensive) work of building and
issuing the proxied request avoids wasted work on requests that were never
going to succeed.
