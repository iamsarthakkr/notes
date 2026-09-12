# Capacity Planning and Estimation — Interview Phrases

## One-Liners
"Capacity planning means estimating memory, storage, network,
servers, and DB size before you design — not after."
"Order of magnitude matters, not precision — 48K req/sec and 50K
req/sec lead to the same architecture decision."
"Concurrent users, not total registered users, drive load."

## Peak vs Average
"Design for peak RPS, not average RPS — average-only design breaks
under real traffic spikes."

## The Core Principle
"Capacity planning drives architecture, not the other way around —
a system estimated at 50 req/sec doesn't need sharding."

## Closing Summary
"Estimate first, then justify the architecture with the numbers —
never the reverse."
