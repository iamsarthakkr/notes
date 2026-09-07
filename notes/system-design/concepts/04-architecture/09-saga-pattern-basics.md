# Saga Pattern Basics

## Recap
[[01-monolith-vs-microservices]] flagged that microservices make
distributed transactions hard — each service typically owns its own
database, so there's no single DB transaction that can atomically
span multiple services. The Saga pattern is the standard answer to
that problem. This is a basics-level introduction; full depth
(including 2PC comparisons) is a separate later-phase roadmap topic.

## Why It Exists
In a monolith, a multi-step business operation — place an order,
reserve inventory, charge payment — can be wrapped in one ACID
transaction (see [[03-transactions-acid]]): all steps commit together
or all roll back together.

In microservices, each step often lives in a different service with
its own database. There's no single transaction that can span all of
them, so a different mechanism is needed to keep things consistent
when a step partway through fails.

## What a Saga Is
A saga is a sequence of local transactions, one per service, where
each step has a corresponding **compensating action** that undoes it
if a later step fails.

Core idea: instead of one atomic all-or-nothing transaction, each
step commits independently and immediately. If something later fails,
compensating steps explicitly run to undo the earlier ones. This
trades atomicity for eventual consistency (see
[[05-sync-vs-async]]).

**Concrete example**: order placed → inventory reserved → payment
charged. If payment charging fails, the saga runs compensating
actions in reverse: release the reserved inventory, cancel the order.
Nothing was ever atomically rolled back — each undo is its own
explicit operation.

## Two Coordination Styles

### Choreography
No central coordinator — each service listens for events from the
previous step and reacts, publishing its own event when done. This is
a direct application of event-driven architecture (see
[[04-event-driven-architecture]]).

**Concrete flow**: `OrderService` creates the order, publishes
`OrderCreated` → `InventoryService` reacts, reserves stock, publishes
`InventoryReserved` → `PaymentService` reacts, charges payment,
publishes `PaymentCharged` (or `PaymentFailed`, which other services
listen for to trigger their compensating actions).

- **Advantage**: no single point of coordination, services stay
  loosely coupled
- **Disadvantage**: hard to see the overall flow just by reading
  code — the saga's logic is smeared across every service's event
  handlers, making it hard to answer "what's the full order flow"
  without tracing events across services

### Orchestration
A central coordinator (an orchestrator) explicitly calls each service
in sequence and decides what to do next based on each step's result,
including triggering compensating actions on failure.

- **Advantage**: the whole flow is visible in one place — much easier
  to understand, debug, and modify the sequence of steps
- **Disadvantage**: the orchestrator becomes a critical component
  every step depends on, and it needs its own logic to track saga
  state — what step this instance is on, what compensations need to
  run

## Choosing Between Them
Choreography fits simpler flows with few steps and services that are
already communicating via events. Orchestration fits more complex,
multi-step flows where visibility into the overall process matters
more than avoiding a central component.

This isn't a universal rule, it's a real tradeoff — teams often start
with choreography for simplicity and move to orchestration as a
flow's step count and complexity grow.

## The Tradeoff
Sagas give distributed operations a way to stay consistent without a
distributed transaction, at the cost of giving up atomicity — state
exists in a temporarily inconsistent state between steps — and adding
the real engineering burden of writing correct compensating actions
for every step.

## Comparison Table

| Property | Choreography | Orchestration |
|---|---|---|
| Coordination mechanism | Services react to each other's events | Central orchestrator calls each service in sequence |
| Visibility into overall flow | Low — smeared across event handlers | High — the whole flow lives in one place |
| Coupling | Loose — services only know event names | Tighter — orchestrator knows every service in the flow |
| Single point of failure risk | None | The orchestrator is a critical dependency |
| Best-fit complexity level | Simple flows, few steps | Complex, multi-step flows needing visibility |
