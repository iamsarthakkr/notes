# Scalability Bottlenecks — Interview Phrases

## One-Liners
"A bottleneck is the slowest part of the system that caps overall
throughput, no matter how fast everything else is."
"Scalability is iterative: fix the current bottleneck, find the next
one — never a one-time fix."

## The App Server vs DB Example
"An app server doing 10K req/sec means nothing if the DB behind it
caps at 2K req/sec — the DB is the bottleneck."

## The Core Principle
"Scaling the wrong layer — like adding app servers when the DB is the
bottleneck — buys you nothing."
"You can't find the bottleneck without capacity numbers for every
component in the path."

## Closing Summary
"Don't default to 'add more servers' — identify the actual bottleneck
first."
