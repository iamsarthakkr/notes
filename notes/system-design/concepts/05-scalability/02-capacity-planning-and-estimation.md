# Capacity Planning and Estimation

## What Capacity Planning Is
Capacity planning is estimating how many resources a system will
actually need — memory, storage, network, number of servers, DB/cache
size — before you commit to an architecture.

It matters because the cost and architecture appropriate for 100
users is entirely different from what's appropriate for 1 million
users. The same design decision — "do we need sharding?", "do we need
a CDN?" — only makes sense at a given scale; asked in isolation it has
no right answer.

Order of magnitude matters, not precision. In interviews and in real
design work, you care about the order of magnitude, not the exact
figure — 48,730 req/sec and 50,000 req/sec are functionally the same
number for architecture purposes. Don't over-optimize estimation
precision; the goal is to land in the right bucket, not the right
decimal place.

## What You Actually Estimate

### Users
Distinguish daily active users (DAU), monthly active users (MAU), and
concurrent users. Concurrent users — the ones actively generating
requests right now — are what actually drives load, not total
registered users. A system with 10M registered users but 5K
concurrent users is sized for 5K concurrent users, not 10M.

### Requests per Second (RPS)
Distinguish average RPS from peak RPS. A system has to survive peak
traffic, not just handle the average. Designing only for average load
is a common mistake that leads to outages exactly when it matters
most — during traffic spikes.

### Storage
Choose between local disk and object storage based on expected user
load and the type of data being stored — small structured records
behave very differently from large media blobs.

### Bandwidth
High responses/sec requires sufficient network bandwidth to actually
serve them. This is often overlooked next to compute and storage, but
a compute-and-storage-sufficient system can still fall over on
bandwidth.

### Database
As estimated load increases, the DB may eventually need partitioning,
archiving, or sharding (see [[10-database-scaling]]) — but only once
the actual estimated numbers justify it, not preemptively.

## Capacity Planning Drives Architecture, Not the Reverse
This is the core principle: you don't pick sharding, distributed
systems, or microservices because they're "best practice" — you pick
them because the estimated numbers require them.

Example: a system estimated at 50 req/sec does not need sharding or a
distributed architecture. Reaching for either at that load is
overengineering relative to actual load, not sound design.

This ties back to the constraints-drive-design idea from
[[01-system-design-mindset]]: capacity numbers are themselves a
constraint, exactly like team size or budget — the estimate comes
first, and the architecture is a response to it.

## Practical Framing for Interviews
Estimation isn't about being right to the decimal — it's about
proving you understand which numbers matter and how they cascade into
architecture decisions.

A wrong architecture chosen for the right estimated scale is a
smaller mistake than the right architecture chosen for a made-up or
unjustified scale. Get the estimate honest first; the architecture
that follows from it is easier to defend even if imperfect.
