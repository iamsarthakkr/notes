# Monolith vs Microservices

## Monolith
A monolith is an application where all business functionality lives
inside one deployable unit — one codebase, one build artifact, one
deployment, shared memory, and usually one database.

Because everything runs in the same process, components call each
other directly through function calls, not the network. This is why
transactions are simple here: no distributed transaction problem,
just the normal ACID guarantees covered in [[03-transactions-acid]].

**Advantages**
- Simple to build and reason about — one codebase, one mental model
- Easy local development — clone, run, done; no service mesh to spin up
- Fast in-process communication — a function call, not a network hop
- Easier transactions — a single DB and process means normal ACID
  transactions just work, no coordination across services needed

**Disadvantages**
- Codebase grows large and tightly coupled over time — boundaries
  between components erode without discipline
- Scaling is inefficient — you scale the entire app even if only one
  part (e.g. image processing) is under load; you can't scale a
  single hot component independently of the rest

## Modular Monolith
A modular monolith is still one deployable unit, but organized with
strong internal boundaries between modules — each module exposes
only a small public API, and its internals stay private to the rest
of the codebase.

Why it exists: it gets most of the organizational benefits people
reach for microservices for — clear ownership, reduced coupling
between areas of the codebase — without paying the operational cost
of running a distributed system.

**Advantages**
- Easier to maintain than a tangled, boundary-free monolith
- Better ownership boundaries — a team can own a module without
  stepping on another team's internals
- Reduced coupling between modules, since only the public API surface
  is available to call

**Disadvantages**
- The database is still typically shared across modules — modules
  aren't as isolated as separate services would be
- Scaling limitations remain — it's still one deployment, one scaling
  unit; a hot module can't be scaled alone

This is often the right starting point. Most systems don't need
microservices from day one, and jumping straight there before there's
an actual organizational or scaling reason is one of the most common
overengineering mistakes in system design.

## Microservices
Microservices split an application into multiple independently
deployable services, each owning a specific business capability, each
typically with its own database.

The fundamental shift: components now talk over the network (HTTP,
gRPC, messaging) instead of in-process function calls. Almost every
microservices tradeoff traces back to this one change.

**Advantages**
- Independent deployment and scaling per service — scale only the
  service under load
- Better fault isolation — one service failing doesn't necessarily
  take down the others
- Smaller codebases per team, easier for a single team to hold in
  their head
- Ownership aligns with business capabilities, not technical layers

**Disadvantages**
- Network calls introduce latency, timeouts, and partial failures
  that an in-process call never had to deal with
- Distributed transactions become hard — there's no single ACID
  transaction spanning services anymore, so this is typically
  resolved with eventual consistency (the Saga pattern handles this
  in depth — not covered here)
- Operational complexity goes up significantly: deployment pipelines,
  monitoring, service discovery, versioned contracts between services

**Important framing point**: microservices solve organizational
problems (team autonomy, independent deployment cadence) as much as
technical ones. A team that doesn't actually have the organizational
problem — multiple teams stepping on each other, needing to deploy on
different schedules — usually doesn't need the technical solution
either.

## Decision Framework
Constraints drive this choice more than "best practice" — this is the
same Phase 0 framing from [[01-system-design-mindset]]: the actual
constraints in front of you (team size, budget, deadline) should
shape the design, not a general preference for one architecture.

- Tight budget, small team → monolith or modular monolith almost
  always wins
- Reach for microservices only when team size, the need for
  independent deployment cadence, or genuinely differential scaling
  requirements actually justify the operational cost

This isn't a binary choice made once. Many real systems start as a
monolith, evolve into a modular monolith as boundaries harden, then
selectively peel off specific services as scaling or ownership needs
demand it — the strangler pattern (not covered as its own topic here).

## The Tradeoff
Every step from monolith → modular monolith → microservices trades
simplicity and consistency for independent scalability and team
autonomy, at increasing operational cost. Think of it as a spectrum,
not three unrelated options.

## Comparison Table

| Property | Monolith | Modular Monolith | Microservices |
|---|---|---|---|
| Deployment unit | One artifact | One artifact | Many, independent per service |
| DB model | One shared DB | One shared DB (module-partitioned) | Typically one DB per service |
| Scaling granularity | Whole app only | Whole app only | Per service |
| Operational complexity | Low | Low–medium | High |
| Team autonomy | Low | Medium | High |
| Transaction model | Normal ACID, single process | Normal ACID, single process | Distributed — eventual consistency, Saga-style |
