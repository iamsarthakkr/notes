# CQRS Basics

## Recap
[[06-layered-architecture]] and [[07-clean-hexagonal-architecture]]
covered how code within a service is organized. CQRS is a different
kind of split — it separates how writes and reads to the same data
are modeled, not how layers are organized. This is a basics-level
introduction; a deeper dive is a separate later-phase roadmap topic.

## What It Is
CQRS stands for Command Query Responsibility Segregation. The core
idea: use separate models for writes (commands — things that change
state) and reads (queries — things that fetch state), instead of one
model handling both.

**Contrast with the default**: normally the same entity and schema
serve both an `UPDATE` and a `SELECT` — the same table, the same
class. CQRS deliberately splits this into two paths that can be
optimized independently.

## Why It Exists
Read and write workloads often have very different shapes and
different scaling needs. Reads are frequently much higher volume, and
often need different indexing or a denormalized, precomputed shape
for speed (see [[09-pagination]], [[10-database-scaling]], and
[[02-normalization-denormalization]] for the read-scaling and
denormalization tradeoffs behind this). Writes, meanwhile, need to
enforce strict consistency and validation.

A single shared model is a compromise that isn't ideal for either
side. CQRS removes that compromise by letting each side be shaped for
its own job.

## What It Looks Like in Practice
- **Command side** — a normal write path: validate, apply business
  rules, persist to the primary/source-of-truth store
- **Query side** — a separate, often denormalized read model. Could
  be a different table, a different database entirely, or a cache —
  built and kept in sync from the command side's changes
- **Sync mechanism** between the two is often event-driven (see
  [[04-event-driven-architecture]]) — a write triggers an event, and a
  subscriber updates the read model

## CQRS Does Not Require Event Sourcing
A common misconception: CQRS is often mentioned alongside event
sourcing, but they're independent ideas. CQRS can be done with a
normal database and a simple sync job — event sourcing is a separate,
more involved pattern (a distinct later-phase roadmap topic, not
covered here).

## Advantages
- Read and write sides can be scaled, indexed, and optimized
  completely independently
- The query side can be heavily denormalized or precomputed for speed
  without compromising the write side's data integrity
- Complex read requirements (dashboards, reports, search) don't force
  awkward compromises onto the transactional write model

## Disadvantages
- Added complexity — two models to maintain instead of one, plus the
  sync mechanism between them
- Eventual consistency between the write and read sides (see
  [[05-sync-vs-async]]) — a write may not be immediately visible on
  the read side, which needs to be an acceptable tradeoff for the use
  case
- Overkill for most CRUD scenarios where a single model handles both
  read and write perfectly well — reach for this only when read/write
  patterns have genuinely diverged, not by default

## When to Use It
- Read and write loads are very different in volume or shape — e.g. a
  system with heavy reporting/analytics layered on top of a
  transactional core
- Complex query requirements would otherwise force denormalization or
  awkward compromises onto the primary transactional model
- This is not a default choice — most systems don't need this split

## The Tradeoff
CQRS trades a single simple model for independently optimizable
read/write paths, at the cost of added complexity and eventual
consistency between them. Justified only when read and write patterns
have genuinely diverged enough to need it.

## Comparison Table

| Property | Single Model | CQRS |
|---|---|---|
| Consistency model | Immediate — one model, always current | Eventual — read side lags behind writes |
| Scaling flexibility per side | Coupled — read and write scale together | Independent — each side scales and indexes for its own workload |
| Complexity | Low — one model to maintain | Higher — two models plus a sync mechanism |
| Best-fit scenario | Typical CRUD workloads | Heavy divergence between read and write patterns (e.g. reporting on a transactional core) |
