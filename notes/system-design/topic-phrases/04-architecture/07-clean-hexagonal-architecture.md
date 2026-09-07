# Clean & Hexagonal Architecture — Interview Phrases

## One-Liners
"Clean/Onion architecture: business logic sits at the center with zero
knowledge of frameworks or infrastructure, and dependencies are only
allowed to point inward toward it."
"Hexagonal architecture (ports & adapters): business logic depends only
on interfaces (ports) it defines, and concrete implementations
(adapters) plug into those ports from the outside."

## The Dependency Rule
"Outer layers can depend on inner layers, but inner layers can never
depend on outer layers — the domain layer literally can't import a
Spring annotation or a JPA entity."

## Port vs Adapter
"A port is the interface the business logic defines for what it
needs — like a `UserRepository` interface — and an adapter is the
concrete implementation behind it, like a JPA-backed repository, which
can be swapped for a MongoDB one without the business logic ever
knowing."

## "Why Clean or Hexagonal Instead of Plain Layered?" — Ready Answer
"Layered architecture relies on discipline to keep business logic
framework-independent, and that discipline erodes over time. Clean and
Hexagonal make it structural instead — the business logic can't
compile if it depends on infrastructure — so it stays testable in
isolation and you can swap out a DB or messaging system by writing a
new adapter instead of touching the core logic."

## Closing Summary
"Clean and Hexagonal are the same idea — protect business logic from
frameworks — just expressed as different mental models."
