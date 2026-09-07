# System Design Mindset

## What Is System Design
Process of planning and structuring the architecture of a software 
system based on requirements. Focus is on:
- How components interact, share, and store data
- How the system behaves under load
- How it handles failure
- How it can be operated and evolved over time

Less about individual algorithms, more about component interaction 
and system-level tradeoffs.

## HLD vs LLD

| | HLD | LLD |
|---|---|---|
| Focus | Overall architecture | Detailed class/module design |
| Defines | Components + interactions | Logic, data structures, APIs |
| Goal | Scalability, performance, reliability | Implementation, maintainability |
| Audience | Architects, stakeholders | Developers, engineers |

## Functional vs Non-Functional Requirements

**Functional** — what the system must do
- Upload posts, login with username/password, send messages
- Specific features and behaviors

**Non-Functional** — how well the system performs
- 99.9% availability
- Response time < 200ms
- Secure authentication
- These drive architecture decisions more than functional requirements

**Interview tip:** Always clarify both before designing anything.
Non-functional requirements determine your entire architecture —
a system needing 99.99% availability looks completely different
from one needing 99%.

## Constraints
Limitations that affect design decisions.

Types:
- Budget — limits infrastructure choices
- Time — limits complexity of solution
- Team size — limits operational overhead acceptable
- Legal/compliance — drives data residency, encryption, audit requirements

**How constraints drive design:**
- Tight budget → managed services over custom infrastructure
- Small team → monolith or modular monolith over microservices
- Legal constraints → data must stay in specific region → affects DB 
placement, CDN choices, replication strategy

## Engineering Tradeoffs
There is no perfect design. Every decision improves one thing 
at the cost of another.

Common tradeoffs:
- Latency vs Throughput — optimizing for speed per request vs 
total requests handled
- Consistency vs Availability — CAP theorem in practice
- Cost vs Complexity — simpler is cheaper to run and operate
- Read performance vs Write performance — denormalization helps 
reads, hurts writes
- Scalability vs Simplicity — distributed systems scale better 
but are harder to operate

**How to frame in interviews:**
Never present a choice as purely good. Always say:
"I'm choosing X over Y because [reason], accepting the tradeoff 
of [cost]."

Example: "I'm choosing eventual consistency over strong consistency 
here because the write throughput requirement is high and users 
can tolerate slightly stale feed data — accepting that likes/counts 
may lag by a few seconds."
