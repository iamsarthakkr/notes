# Vertical vs Horizontal Scaling — Interview Phrases

## One-Liners
"Vertical scaling means a bigger machine — it's the simplest first
move, no architecture change needed, but it hits a hardware ceiling
and stays a single point of failure."
"Horizontal scaling means more machines plus a load balancer — no
hard ceiling, but it shifts the problem elsewhere: stateful sessions,
a shared DB bottleneck, distributed consistency, and network
latency."

## The Kitchen Analogy
"Vertical scaling is one kitchen, a bigger stove, a better chef —
it's still one kitchen."

## The Core Tradeoff
"Horizontal scaling doesn't remove bottlenecks, it relocates them —
usually to the database."

## "When Would You Choose Horizontal Over Vertical?" — Ready Answer
"I'd reach for horizontal scaling once a single machine's limit is
actually hit, once I need high availability rather than just more
throughput, or once I need more throughput than any single box could
give me. Below that, vertical scaling is simpler and I'd default to
it."

## Closing Summary
"The real cost of horizontal scaling isn't infrastructure, it's the
consistency and statefulness problems it creates."
