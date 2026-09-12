# Backpressure

## What Backpressure Is
Backpressure is a mechanism that prevents a system from taking on
more work than it can safely process.

Analogy: a restaurant with capacity for 100 meals/hour suddenly gets
10,000 orders/hour. The better move is to stop accepting new orders
rather than accept everything and fail to deliver any of them
properly.

## What Happens Without Backpressure
Example: an API built for 1,000 req/sec suddenly receives 10,000
req/sec.

Without backpressure: traffic keeps coming in → the thread pool fills
up → the queue grows unbounded → requests start timing out →
timeouts cascade into further retries and load → the system
eventually crashes entirely (cascading failure).

This typically shows up in HTTP request handling, thread pools,
message queues, and databases — anywhere work can queue up faster
than it's consumed.

## Common Backpressure Strategies

**Reject requests.** When the system is full, return an explicit
error (e.g. HTTP 429 Too Many Requests) instead of silently accepting
more work than it can handle.

**Slow producers.** Instead of a producer pushing work as fast as
possible, make it wait and send fewer requests — very common in
messaging systems.

**Bounded queues.** Putting everything into an unbounded queue is not
a good idea. Example: workers process 100 jobs/sec but incoming work
is 1,000 jobs/sec — the queue grows by 900/sec, filling memory and
causing high latency. Solution: bound the queue's max size, and
reject new work once it's full.

**Drop low-priority work.** Not every operation is equally important
— under heavy load, drop or defer lower-priority work (e.g.
analytics) to protect critical paths.

**Graceful degradation.** Disable expensive, non-essential features
instead of letting the whole system crash — e.g. under extreme load,
disable recommendations and delay comment processing, but keep the
core feed working.

## Worked Example: Ticket Booking Under Extreme Load
Scenario: 5 million users trying to book simultaneously.

Without backpressure, the system crashes or throws errors for most
users.

Better: a waiting room that admits users gradually, converting a
spike into a controlled, sustainable booking rate.

## Why This Belongs at the End of the Scalability Phase
Every other topic in this phase — read scaling, write scaling,
bottleneck fixes, partitioning — is about increasing what a system
can handle.

Backpressure is the complementary idea: no matter how much you scale,
there's always a load that exceeds capacity. Backpressure is what
keeps the system alive and predictable when that happens, rather than
pretending it can absorb infinite load.
