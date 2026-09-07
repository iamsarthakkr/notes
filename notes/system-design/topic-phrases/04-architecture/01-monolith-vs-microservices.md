# Monolith vs Microservices — Interview Phrases

## One-Liners
"A monolith is one deployable unit with all business functionality
and usually one shared database."
"A modular monolith is still one deployment, but with strong internal
module boundaries — each module exposes a small public API and hides
its internals."
"Microservices split the app into independently deployable services,
each owning a business capability, typically with its own database."

## The Core Tradeoff
"Every step from monolith to modular monolith to microservices trades
simplicity and consistency for independent scalability and team
autonomy. The cost side of that trade is operational complexity —
it goes up at every step."

## "When Would You Choose Microservices Over a Monolith?" — Ready Answer
"Only when there's an actual reason to justify the cost — enough
teams that they need to deploy independently on different schedules,
or specific components with genuinely differential scaling needs that
the rest of the app doesn't have. If it's a small team or the scaling
is roughly uniform across the app, a monolith or modular monolith is
almost always the better call — microservices add real operational
overhead that isn't worth paying without a concrete need for it."

## Organizational vs Technical
"Microservices solve organizational problems — team autonomy,
independent deployment cadence — as much as technical ones; a team
without that organizational problem usually doesn't need the
technical solution."

## Closing Summary
"Start with a monolith or modular monolith, and move to microservices
only when a specific organizational or scaling need actually justifies
the cost."
