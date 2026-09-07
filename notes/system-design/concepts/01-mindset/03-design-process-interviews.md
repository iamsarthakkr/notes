# Design Process for Interviews

## The Framework
Every system design interview follows this structure.
Knowing the framework lets you control the conversation.

### Step 1 — Clarify Requirements (5 min)
Ask questions before touching the whiteboard.

Functional:
- "What are the core features we need to support?"
- "Are we building read-heavy or write-heavy?"
- "Do we need real-time or is eventual consistency ok?"

Non-functional:
- "What scale are we targeting? DAU?"
- "What's the availability requirement?"
- "Any latency constraints?"

Constraints:
- "Any specific tech constraints?"
- "Global or single region?"

Never assume. Clarifying shows senior thinking.

### Step 2 — Capacity Estimation (5 min)
- Estimate DAU, RPS (read + write), storage, bandwidth
- Identify the constraint (read-heavy? write-heavy? storage-heavy?)
- Let numbers drive your next decisions

### Step 3 — High Level Design (15-20 min)
- Draw the main components: client, API gateway, services, DB, cache
- Walk through the core user flows (happy path first)
- Keep it simple — one box per responsibility
- Don't go deep yet, stay high level

### Step 4 — Deep Dive (15-20 min)
- Interviewer will guide you to interesting areas
- Common deep dives: DB schema, caching strategy, 
  scaling bottleneck, consistency model
- This is where you show depth — tradeoffs, alternatives considered

### Step 5 — Identify + Resolve Bottlenecks (5 min)
- "Given this design, where does it break at scale?"
- Walk through each component under load
- Propose solutions with tradeoffs stated

## Time Boxing (45-minute interview)
0-5 min    → Clarify requirements
5-10 min   → Capacity estimation
10-25 min  → High level design
25-40 min  → Deep dive
40-45 min  → Bottlenecks + wrap up

## How To Open
Never start drawing immediately. Say:

"Before I start designing, let me clarify a few things to make 
sure I'm solving the right problem."

Then ask 3-5 targeted questions. This buys you thinking time 
and shows structured approach.

## How To Handle Not Knowing Something
Don't fake it. Say:

"I'm not deeply familiar with [X] — I know it's used for [general 
purpose]. I'd approach it by [reasoning from first principles]. 
Is that the direction you want to explore?"

Interviewers care more about your reasoning process than whether 
you know every technology.

## How To State Tradeoffs
Never present a decision without its cost:

"I'm going with [choice] here because [reason]. The tradeoff is 
[cost] — which I think is acceptable given [justification]. 
If [scenario changed], I'd reconsider and use [alternative] instead."

## Common Mistakes To Avoid
- Starting to draw before clarifying requirements
- Going deep on one component and ignoring the rest
- Presenting choices without stating tradeoffs
- Never mentioning failure scenarios
- Forgetting to mention consistency model for distributed data
