# Serverless — Interview Phrases

## One-Liner — Serverless
"Serverless means you deploy code without managing the underlying
servers — the servers still exist, the provider just handles
provisioning, scaling, and patching for you."

## One-Liner — FaaS
"FaaS deploys code as individual functions that run in response to
triggers instead of a long-running process — AWS Lambda is the
standard example."

## Cold Starts
"A cold start is the latency added when a function that hasn't run
recently has to spin up from zero to handle a request. It happens
because, unlike a traditional server, there's no warm process sitting
ready — it's the most commonly cited practical downside of
serverless."

## "When Would You Use Serverless vs a Traditional Service?" — Ready Answer
"Serverless is a great fit for event-driven or bursty workloads —
processing uploads, queue messages, anything where traffic is
unpredictable and you want to pay only for actual usage. For very
high, sustained, steady-state traffic, a well-tuned traditional server
fleet is often more predictable and cost-effective, and you avoid
cold-start latency entirely."

## Microservices vs Serverless — Not Synonyms
"Microservices is about how the application is split; serverless is
about how the code is deployed and run. A single microservice can be
serverless, and serverless functions don't have to follow
microservice boundaries — they're different axes of the same broader
question."
