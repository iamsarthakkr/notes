# Serverless

## What Serverless Is
Serverless is a cloud computing model where code is deployed without
managing the underlying servers — the cloud provider handles
provisioning, scaling, patching, and availability of the
infrastructure.

The name is misleading: servers still exist and still run the code.
"Serverless" means the developer doesn't manage them, not that
there's no server involved.

What the provider handles:
- Providing the servers the code actually runs on
- Load balancing across whatever instances are running
- Scaling — both up under load and down to zero when idle
- Maintenance and patching of the underlying infrastructure

## Function as a Service (FaaS)
FaaS is the most common serverless model — code is deployed as
individual functions that execute in response to triggers, not as a
long-running process.

**Examples**: AWS Lambda, Google Cloud Functions.

**Execution model**: a function spins up when triggered, runs,
returns or finishes, and spins back down — there's no persistent
process sitting idle waiting for the next request. Contrast this with
a traditional server, which stays running continuously whether or not
it's actively handling a request right now.

## Serverless Is Typically Event-Driven
Most serverless platforms trigger functions off events, not just HTTP
requests — a file uploaded to storage triggers a function, a message
published to a queue triggers a function. This ties directly into
event-driven architecture (covered as its own topic later; pub/sub
and brokers aren't re-explained here).

This makes serverless a natural fit for event processing pipelines,
not just simple request/response APIs.

## Advantages
- No server management overhead — no patching, no capacity planning
- Autoscaling is automatic and often near-instant, including scaling
  to zero when there's no traffic — and no cost during that time
- Great fit for event processing and bursty, unpredictable workloads

## Disadvantages
**Cold starts** — when a function hasn't run recently, spinning it up
from zero adds latency to that request, because there's no warm
process sitting ready to handle it the way a traditional server
always has one running. This is the most commonly cited practical
pain point of serverless.

**Execution limits** — most platforms cap max execution duration,
memory, and payload size. Serverless isn't suited to long-running
processes.

**Sustained high throughput** — for very high, steady-state traffic,
a well-tuned traditional server fleet can in some cases scale and
tune more predictably (and cheaply) than a serverless setup handling
the same constant load.

## Microservices vs Serverless
These solve different axes of the same broader "how do we split and
deploy our application" question — they're not synonyms, and it's
worth being precise about the distinction:

- **Microservices** is about how the application is split — by
  business capability, into independently deployable services (see
  [[01-monolith-vs-microservices]])
- **Serverless** is about how the code is deployed and run — managed,
  event-triggered, ephemeral execution vs a server you provision and
  keep running yourself

A single microservice can be deployed as a serverless function, and a
serverless function doesn't have to follow microservice boundaries at
all. They're not mutually exclusive — they answer different
questions.

## When to Reach for Serverless
**Good fit**: event-driven processing (resizing an image on upload,
sending notifications, processing queue messages), bursty or
unpredictable traffic where paying only for actual usage matters,
glue code connecting other managed services together.

**Poor fit**: long-running processes, workloads that need predictable
low latency on every single request (cold starts work against this),
very high sustained steady-state traffic where a well-utilized
traditional server is more cost effective.

## The Tradeoff
Serverless trades operational control and consistent latency for zero
infrastructure management and automatic scaling. It's a deployment
model choice layered on top of — not a replacement for — the
architectural style decisions covered in
[[01-monolith-vs-microservices]].

## Comparison Table

| Property | Traditional Server | Microservices on Servers | Serverless |
|---|---|---|---|
| Who manages scaling | You (capacity planning, autoscaling groups) | You, per service | Provider, automatic |
| Cost model | Pay for provisioned capacity, even idle | Pay for provisioned capacity per service, even idle | Pay per invocation — near-zero cost when idle |
| Cold start risk | None — process is always running | None — process is always running | Real — idle functions spin up from zero |
| Typical use case | Steady, predictable traffic | Independently owned business capabilities | Event processing, bursty/unpredictable traffic |
