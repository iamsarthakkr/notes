# Event-Driven Architecture

## What It Is
In event-driven architecture (EDA), instead of one component directly
calling another in a request-driven flow, services communicate by
producing and responding to events.

An event is a fact that something has already happened — e.g.
`EnrollmentCreated` — not a command telling another service what to
do. It's a statement of what occurred, not an instruction.

**Contrast with the typical request flow**: a main request creates
the primary result and returns a response immediately. Everything
else that needs to happen as a business consequence — notifications,
analytics, recommendations — doesn't need to be part of that main
request. It can happen in parallel, triggered by the event, instead
of the caller waiting on all of it before getting a response.

**Advantages**
- Loose coupling — the publisher doesn't need to know who's listening
- Fan-out — one event can trigger many independent reactions
- Async processing — the main request finishes without waiting on
  follow-up work
- Better fault tolerance — if one subscriber is down, the broker can
  hold messages until it recovers, rather than the whole flow failing

**Disadvantages**
- Eventual consistency — subscribers process events some time after
  they're published, not instantly (ties back to the eventual vs
  strong consistency tradeoff covered later)
- Harder to debug — a business action's effects are spread across
  multiple services reacting asynchronously, instead of one traceable
  synchronous call stack
- Distributed transactions become eventual-consistency problems
  instead of atomic ones (the Saga pattern handles this — covered as
  its own topic later, not explained here)

**Important framing point**: real systems commonly use both
request-driven (REST/gRPC) and event-driven patterns together. It's
not an either/or architectural choice — most systems have a
synchronous path for the primary action and an event-driven path for
the consequences of that action.

## Pub/Sub (Publisher/Subscriber)
Pub/sub is a messaging pattern where one service (the publisher)
sends a message/event, and other services (subscribers) receive the
messages they've subscribed to. It's the messaging mechanism EDA is
typically built on.

- **Publisher** — the service sending the event; doesn't need to know
  who's subscribed or how many subscribers exist
- **Subscriber** — a service listening for events it cares about
- **Topic** — a named channel/category that events are published to
- **Broker** — the system in the middle that stores and routes
  messages between publishers and subscribers (examples: Kafka,
  RabbitMQ)

## Topic vs Queue
This distinction is the core thing to get right when using a broker:

- **Queue** — one message is processed by exactly ONE consumer. Used
  to distribute work across a pool of workers. Example: sending 1000
  emails using 5 workers — each email job should be processed once,
  by a single worker; work gets distributed across the pool.
- **Topic** — one message can go to MANY subscribers. Used to
  broadcast an event to multiple independent interested parties.
  Example: an `EnrollmentCreated` event published to a topic reaches
  an email service, an audit service, and an analytics service
  simultaneously — each doing its own independent thing with the same
  event.

Queue = work distribution (one consumer per message). Topic =
broadcast (many consumers per message). Picking the wrong one either
duplicates work that should happen once, or loses fan-out that should
reach many.

## The Tradeoff
EDA buys loose coupling, fan-out, and resilience to a slow or down
consumer, at the cost of eventual consistency and harder end-to-end
debugging. It's the right default for "things that should happen as a
consequence" and the wrong choice for "things that must happen
atomically before responding to the user."

## Comparison Tables

**Request-Driven vs Event-Driven**

| Property | Request-Driven (sync) | Event-Driven (async) |
|---|---|---|
| Coupling | Caller knows the callee directly | Publisher doesn't know subscribers |
| Consistency model | Immediate — response reflects the full result | Eventual — subscribers catch up after the fact |
| Failure isolation | A downstream failure can fail the whole request | A down subscriber doesn't block the main flow |
| Debuggability | One traceable call stack | Spread across services, harder to trace end-to-end |
| Typical use case | The primary action itself (place an order) | Consequences of the action (notify, log, analyze) |

**Queue vs Topic**

| Property | Queue | Topic |
|---|---|---|
| Consumers per message | Exactly one | Many |
| Use case | Distribute work across a worker pool | Broadcast an event to independent interested parties |
| Example | 1000 emails split across 5 workers | `EnrollmentCreated` reaching email, audit, and analytics services |
