# HTTP — Application Protocol

## What It Is
HTTP is a stateless, request-response application protocol. It
defines the semantics of a request and response — methods, status
codes, headers — not how bytes actually get from client to server.
Transport is someone else's job.

Core question: "What did the client ask for, and what should the
server send back?"

## The Stack
```text
HTTP  — request/response semantics (GET /users/42, 200 OK, headers)
TLS   — encrypts + authenticates the connection
TCP   — reliable, ordered delivery (handshake, sequence numbers)
IP    — routes packets between hosts, no guarantees
```

Each layer solves one problem and hands a clean abstraction to the
layer above. HTTP doesn't know packets get reordered — TCP already
fixed that. HTTP doesn't know the connection could be sniffed — TLS
already fixed that.

## Request Structure
```http
POST /payments HTTP/1.1          <- request line: method + path + version
Host: api.example.com
Authorization: Bearer <token>    <- headers: metadata
Content-Type: application/json
Idempotency-Key: 7c3f9a2e

{"amount": 500, "currency": "USD"}   <- body: optional payload
```

- Request line — method, path, HTTP version
- Headers — auth, content negotiation, caching hints (Cache-Control, ETag)
- Body — optional; absent on GET, present on POST/PUT typically

## Statelessness
Each request carries everything the server needs to process it —
the server holds no memory of previous requests from that client.

What it means:
- Server process has no session/context between requests
- Any server instance can handle any request

What it does NOT mean:
- That state doesn't exist anywhere — cookies, JWTs, DB-backed
  sessions all exist. Statelessness is about the server process,
  not the system as a whole. The client (or a shared store) carries
  the state; the server just doesn't hold it in memory between calls.

Why it enables scaling:
- Any server behind a load balancer can serve any request — no
  sticky sessions required, trivial horizontal scaling
- Safe retries — if a request fails, hit any server, not "the one
  that remembers you"
- No per-client memory footprint on the server — memory doesn't
  grow with connected clients

## Idempotency
An operation is idempotent if calling it once has the same effect
as calling it N times.

Idempotent by spec: GET, PUT, DELETE
Not idempotent: POST

The POST payment retry problem:
1. Client sends `POST /payments` to charge a card
2. Server processes the charge, but the response times out before
   reaching the client
3. Client assumes failure, retries the POST
4. Card gets charged twice — the operation had a side effect, and
   retrying repeated that side effect

Idempotency keys — the fix:
- Client generates a unique key per logical operation (UUID) and
  sends it on every attempt (including retries) of that same operation
- Server checks the key before processing: if seen before, return
  the original result instead of processing again

```java
@Service
public class PaymentService {

    private final IdempotencyKeyRepository keyRepository;
    private final PaymentRepository paymentRepository;

    public PaymentResult charge(String idempotencyKey, ChargeRequest request) {
        Optional<PaymentResult> existing = keyRepository.findResult(idempotencyKey);
        if (existing.isPresent()) {
            return existing.get(); // already processed, return cached result
        }

        PaymentResult result = processCharge(request);
        keyRepository.save(idempotencyKey, result); // store atomically with the charge
        return result;
    }
}
```

The key insight: the lookup-and-save must be atomic (a unique
constraint on the key column, or a single transaction) — otherwise
two concurrent retries can both pass the check before either saves,
and you're back to a double charge.

## Infra Decisions from HTTP Methods
- GET is safe (no side effects) and cacheable — CDNs, browsers,
  and reverse proxies cache GET responses by default
- POST has side effects and is not cacheable by default — caching
  infra branches on method precisely because caching a POST could
  serve a stale result for an operation that was supposed to happen
  again

This is why REST API design leans on GET for reads and POST for
writes — it's not just convention, caching and retry behavior
downstream depend on it.
