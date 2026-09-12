# Scalability Bottlenecks

## What a Bottleneck Is
A bottleneck is the slowest part of the entire system — the one that
limits overall throughput or increases overall latency, regardless of
how fast every other component is.

The key insight: a system is only as fast as its slowest
critical-path component. Overprovisioning everything except the
bottleneck buys you nothing — the extra capacity elsewhere just sits
idle, waiting on the one component that can't keep up.

## Scalability Is Iterative, Not a Fix
Scalability isn't a one-time fix. It's the iterative process of:
identify the current bottleneck → fix or scale past it → find the
next one.

There is always a next bottleneck once the current one is fixed.
Scaling is a moving target, not a solved state — removing today's
constraint just exposes whatever the next-slowest component is.

## Worked Example: App Server vs DB
An app server can handle 10,000 req/sec, but the DB behind it can
only handle 2,000 req/sec. The effective system throughput is capped
at 2,000 req/sec regardless of the app server's capacity.

The DB is the bottleneck here — not the app server — even though the
app server "looks" like the busier, more heavily-loaded component at
a glance.

## Why Scaling the Wrong Layer Does Nothing
Scaling one layer — e.g. adding more app servers — without addressing
the actual bottleneck (the DB) does nothing for overall system
throughput. It just makes the app servers idle faster while they
still wait on the same 2,000 req/sec DB behind them.

## Why This Matters for Design Discussions
Before scaling anything, identify what's actually the bottleneck.
Don't reflexively add more app servers or reach for horizontal
scaling as a default reaction to "the system is slow."

Bottleneck identification requires knowing the throughput/capacity of
every component in the request path — not just the one that's easiest
to scale. This connects directly to
[[02-capacity-planning-and-estimation]]: you can't identify a
bottleneck without having estimated numbers for each component to
compare against.

## What This Sets Up
This concept is the frame for the next several scalability topics —
common bottlenecks & fixes, read scaling, write scaling. Each of
those is essentially "here's a specific bottleneck category and how
to fix it."
