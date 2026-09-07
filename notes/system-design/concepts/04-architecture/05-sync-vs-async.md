# Sync vs Async Communication

## Recap
[[04-event-driven-architecture]] covered event-driven architecture as
one particular async communication pattern — publishing events to a
broker for other services to react to. This file zooms out: sync vs
async is the general communication-style decision underneath EDA,
RPC, and everything in between, and it applies just as much to a
single method call as it does to a full messaging system.

## Synchronous Communication
The caller sends a request and blocks, waiting for a response before
continuing — the calling thread or process can't proceed until it
gets a result back.

**Examples**: a typical REST API call, a direct method call within a
monolith, a database query — in all of these, the calling code waits
for the result.

**Advantages**
- Simple to reason about — code reads top to bottom
- The result is available immediately when the call returns
- Error handling is straightforward — the failure happens right
  there, and you know immediately

**Disadvantages**
- The caller is blocked for the full duration of the call, including
  any latency or slowness in the callee — if the downstream service
  is slow, the caller is slow
- Failures propagate immediately and directly, with no isolation —
  this is the same point made in [[01-monolith-vs-microservices]]
  about network calls introducing latency, timeouts, and partial
  failures

## Asynchronous Communication
The caller sends a request and continues immediately without waiting
for the result — the response, if any, is handled later via a
callback, event, message, or by polling.

**Examples**: publishing an event to a broker (see
[[04-event-driven-architecture]]), a background job queue, a webhook
callback, polling a status endpoint.

**Advantages**
- The caller isn't blocked, so it can keep doing other work — better
  throughput and resilience to a slow downstream dependency, since a
  slow consumer doesn't slow down the producer
- Naturally supports fan-out

**Disadvantages**
- Harder to reason about — results aren't immediately available, and
  code has to handle "not done yet" as a real state
- Harder debugging — a single business action's effects are spread
  across time and services, the same tradeoff EDA has, just in its
  more general form
- Error handling is more complex — a failure might be discovered much
  later, requiring retry and dead-letter strategies

## Choosing Between Them
The deciding question: does the caller need the result before it can
proceed or respond to the user? If yes, it's sync. If the work can
happen after the user-facing response has already been sent, it's
async.

**Concrete example pair**: validating a payment before confirming an
order must be sync — the user needs to know right now if payment
failed. Sending a confirmation email after the order is placed should
be async — the user doesn't need to wait for the email to send.

Most real systems are a mix: the critical path the user is waiting on
is sync, and everything that's a consequence of that action is async.
This is the same split described in
[[04-event-driven-architecture]] for event-driven systems,
generalized — sync for "must complete before responding," async for
"can happen after."

## The Tradeoff
Sync is simpler and gives immediate error feedback, but couples the
caller's performance and availability to the callee's. Async
decouples that, at the cost of complexity in tracking results,
debugging, and handling partial or delayed failure. Neither is
"better" — the decision is which parts of a given flow actually need
to block the caller.

## Comparison Table

| Property | Synchronous | Asynchronous |
|---|---|---|
| Caller blocking behavior | Blocks until response returns | Continues immediately, doesn't wait |
| Error handling timing | Immediate — failure known right away | Delayed — failure may surface later, needs retry/dead-letter handling |
| Debuggability | One traceable call, easy to follow | Spread across time and services, harder to trace |
| Throughput impact | Caller's throughput limited by callee's speed | Caller's throughput decoupled from callee's speed |
| Typical use case | Payment validation before confirming an order | Sending a confirmation email after the order is placed |
