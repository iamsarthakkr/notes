# Layered Architecture

## Recap
Files 01-05 covered architectural *styles* — how applications are
split (monolith vs microservices), how they're deployed (serverless),
and how services communicate (event-driven, sync vs async). This file
shifts to architecture *patterns* — how code is organized within a
single service or application. Layered architecture is the most
common starting point for this.

## What It Is
Layered architecture organizes code into layers, each with a specific
responsibility, where each layer typically only talks to the layer
directly below it.

**The standard layers**:
- **Controller** — receives requests, calls the appropriate service,
  returns a response. No business logic here.
- **Service** — where business logic actually lives. This is the
  layer that makes decisions.
- **Repository** — interacts with the DB, responsible for
  persistence. Stores and retrieves business data. No business logic
  here either.

**Concrete example** (using this workspace's naming convention): a
request hits `XController`, which calls `XService` for the business
decision, which calls `XRepo` to persist or retrieve data. Each layer
has exactly one job.

## Why It's the Default
- Easy to understand — a new engineer can predict where any given
  piece of logic lives just from knowing the pattern
- Clear separation of concerns on paper — persistence logic, business
  logic, and request handling don't get mixed together in the same
  class

## Advantages
- Easy to understand and onboard onto
- Separation of concerns between layers

## Disadvantages
- **No enforced boundaries in practice** — nothing stops a controller
  from reaching into repository logic directly, or business logic
  leaking into a controller, unless the team is disciplined about it
- **Tight coupling of business logic to frameworks** — Spring
  annotations and JPA entities often end up directly embedded in
  what's supposed to be pure business logic, making that logic hard
  to test or reuse without the framework
- **Technical grouping over feature grouping at scale** — a large
  layered codebase groups files by technical role (all controllers
  together, all services together) rather than by business feature.
  As the codebase grows, this makes it harder to see everything
  related to one feature at a glance

## When It's Enough
Layered architecture is genuinely fine for small-to-medium projects.
The problems with it — framework coupling, weak boundaries — only
really bite as a codebase grows large or needs to be highly testable
and framework-independent. That's the specific pain these patterns
exist to solve, not a sign that layered is universally worse.

## The Tradeoff
Layered architecture optimizes for understandability and a fast
start, at the cost of weak enforced boundaries and framework coupling
that becomes a real problem only at scale or when
testability/framework-independence matters a lot.

## Comparison Table

| Layer | Responsibility | Should NEVER contain | Typical class suffix |
|---|---|---|---|
| Controller | Receives requests, calls the service, returns a response | Business logic | `XController` |
| Service | Makes business decisions | Direct DB access, request/response handling | `XService` |
| Repository | Persists and retrieves business data | Business logic | `XRepo` |
