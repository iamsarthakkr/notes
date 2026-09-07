# Layered Architecture — Interview Phrases

## One-Liners Per Layer
"Controller: receives the request, calls the service, returns the
response — no business logic."
"Service: where the business logic and decisions actually live."
"Repository: handles persistence — storing and retrieving data, no
business logic."

## The Core Weakness
"Layered architecture has no enforced boundaries — nothing technically
stops a controller from reaching into the repository directly, or
business logic leaking into a controller. It works, but only as long
as the team stays disciplined about respecting the layers."

## "What's Wrong With Layered Architecture at Scale?" — Ready Answer
"Two things. Business logic tends to get tightly coupled to the
framework — Spring annotations and JPA entities end up embedded
directly in what's supposed to be pure business logic, making it hard
to test in isolation. And the codebase is organized by technical role
instead of by feature, so as it grows it gets harder to see everything
related to one business feature in one place."

## When It's Genuinely Fine
"For small-to-medium projects, layered architecture is a perfectly
good default — these problems only really bite at scale."

## Closing Summary
"Layered is the right default until framework coupling or scale makes
stronger boundaries worth the cost."
