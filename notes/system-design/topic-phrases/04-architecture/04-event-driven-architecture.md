# Event-Driven Architecture — Interview Phrases

## One-Liners
"Event-driven architecture: services communicate by producing and
reacting to events instead of calling each other directly."
"An event is a fact that something already happened — not a command
telling another service what to do."

## Queue vs Topic
"A queue delivers each message to exactly one consumer — that's for
distributing work, like splitting 1000 emails across 5 workers. A
topic broadcasts each message to every subscriber — that's for
fan-out, like an `EnrollmentCreated` event reaching the email, audit,
and analytics services all at once."

## "When Would You Use Event-Driven vs a Direct Synchronous Call?" — Ready Answer
"If it's a consequence of the main action — sending a notification,
updating analytics, logging for audit — that belongs on an event,
async, so it doesn't block or fail the main request. If it has to
happen atomically before I respond to the user — like actually
placing the order — that stays a direct synchronous call, because I
need the result before I can respond."

## Mixing Patterns
"Real systems almost always mix both — a synchronous path for the
primary action, and an event-driven path for everything that follows
from it. It's not either/or."

## Closing Summary
"EDA trades immediate consistency for loose coupling and fan-out."
