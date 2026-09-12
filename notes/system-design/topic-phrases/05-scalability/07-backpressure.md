# Backpressure — Interview Phrases

## One-Liners
"Backpressure means preventing a system from taking on more work than
it can safely process, rather than accepting everything and failing."

## Without Backpressure
"Without backpressure: overload → thread pool fills → queue grows
unbounded → timeouts → cascading failure → crash."

## Strategies
"Reject requests (429) when full, instead of silently accepting more
than you can handle."
"Bounded queues: an unbounded queue under sustained overload just
delays the crash while filling memory — bound it and reject new work
once full."
"Drop low-priority work and gracefully degrade non-essential features
— e.g. disable recommendations — to keep the core system alive under
load."

## Waiting Rooms
"Waiting rooms — e.g. ticket booking under a traffic spike — convert
an unmanageable spike into a controlled, sustainable rate."

## Closing Summary
"Scaling increases what you can handle; backpressure protects you
when load exceeds even that — every system needs both."
