# Clean & Hexagonal Architecture

## Recap
[[06-layered-architecture]] named layered architecture's core
weakness: business logic gets tightly coupled to frameworks, and
layer boundaries aren't actually enforced. Clean architecture and
Hexagonal architecture are both direct answers to that specific
problem — different shapes, same underlying idea.

## Clean Architecture (Onion)
**Core principle**: business logic should not care about frameworks —
it should only care about solving the business problem. Frameworks,
databases, and external systems are details, not the center.

**Structure** — inside-out layers, hence the "onion" shape:
- **Core** (innermost) — domain models and business rules, the actual
  problem being solved. Has zero knowledge of anything outside it.
- **Application** — coordinates business operations, orchestrating
  use cases using the core.
- **Infrastructure** (outermost) — everything that talks to the
  outside world: DB, REST controllers, Kafka, Redis, any framework
  code.

**The Dependency Rule**: dependencies always point inward — outer
layers can depend on inner layers, but inner layers must never depend
on outer layers. This is the one rule that makes the whole pattern
work: the domain layer literally cannot import a Spring annotation or
a JPA entity, by construction.

**Why this fixes layered architecture's problem**: business logic
becomes testable and framework-independent by construction, not by
discipline. You can't accidentally couple the core to Spring, because
the dependency direction physically prevents it.

## Hexagonal Architecture (Ports & Adapters)
**Core principle**: the application can communicate with the outside
world from many directions, not in a strict top-to-bottom flow — the
"hexagon" shape is symbolic of multiple entry/exit points, not
literally six sides.

- **Port** — an interface defining what the business logic needs. An
  *input port* is what an external caller invokes to trigger business
  logic; an *output port* represents something the business logic
  needs from the outside, like persistence.
- **Adapter** — the concrete implementation of a port. A REST
  controller adapts an HTTP request into a call on an input port; a
  JPA repository adapts an output port into an actual DB call.

**Concrete example**: business logic depends on a `UserRepository`
interface (the port). It has no idea whether that's implemented via
`JpaRepository` or a MongoDB driver (the adapter) — the business
logic never changes when the persistence technology changes.

**Why this fixes the same problem as Clean Architecture**: business
logic only depends on ports it defines, never on concrete adapters.
Swapping a DB or a messaging system means writing a new adapter, not
touching business logic.

## How They Relate
Clean/Onion and Hexagonal are the same underlying idea — keep
business logic independent of frameworks and external systems —
expressed as different mental models: concentric layers vs ports
feeding into a central hexagon. In practice, teams often blend
language from both rather than picking one purist implementation.

## Advantages (Both)
- Business logic testable in isolation — no framework or DB needed to
  test core rules
- Swapping infrastructure (DB, message broker, web framework) doesn't
  touch business logic
- Enforced boundaries — the dependency rule / ports make coupling a
  compile-time problem, not a code-review discipline problem

## Disadvantages (Both)
- Overkill for small projects — the extra interfaces and abstraction
  layers add real ceremony and indirection for a CRUD app that will
  never swap its DB or framework
- Steeper learning curve for a team used to layered architecture
- More files and interfaces to maintain long-term for the same
  functionality

## When to Reach for These
Reach for Clean or Hexagonal when business logic is complex enough to
be worth protecting and testing in isolation, or the team genuinely
expects to swap infrastructure (DB, external service) at some point.
Otherwise, layered architecture ([[06-layered-architecture]]) is the
more honest choice.

## The Tradeoff
Both patterns trade simplicity and directness for enforced
independence of business logic from frameworks and infrastructure.
Worth it when business logic complexity or infrastructure volatility
is real; pure overhead when it isn't.

## Comparison Table

| Property | Layered | Clean (Onion) | Hexagonal |
|---|---|---|---|
| Where business logic lives | Service layer | Core (innermost) | Center, behind ports |
| Framework coupling prevention | Discipline only | Structural — the Dependency Rule | Structural — ports/adapters |
| Testability without framework | Weak — often entangled with framework code | Strong — core has zero outside knowledge | Strong — business logic depends only on interfaces it defines |
| Learning curve | Low | Moderate–high | Moderate–high |
| Best-fit project size | Small–medium | Medium–large, complex domain logic | Medium–large, complex domain logic or volatile infrastructure |
