# Complete System Design Roadmap

> Goal:
> Become a strong backend engineer capable of designing, building and scaling real-world systems while also being fully prepared for HLD and LLD interviews.

---

# Learning Methodology

For every topic:

1. 📖 Learn the theory
2. 🧠 Understand tradeoffs
3. ✏️ Solve small design exercises
4. 💻 Build a small implementation (where applicable)
5. ❓Knowledge review
6. 🎯 Interview-style design question

---

# Progress

- [x] Networking Fundamentals
- [x] Database Fundamentals & Internals
- [ ] High Level Design
- [ ] Distributed Systems
- [ ] Low Level Design
- [ ] Complete Interview Preparation

---

# Phase 0 — System Design Mindset

## Theory

- [x] What is System Design?
- [x] High Level Design vs Low Level Design
- [x] Functional Requirements
- [x] Non Functional Requirements
- [x] Constraints
- [x] Engineering Tradeoffs
- [x] Capacity Estimation
- [x] Bottleneck Analysis
- [x] Design Process for Interviews

## Practice

- [ ] Notes App
- [ ] Todo App
- [ ] URL Shortener (Requirements only)

---

# Phase 1 — Networking & Communication ✅

> Status: COMPLETED (Revision only when needed)

## Networking

- [x] HTTP
- [x] HTTP Request / Response
- [x] Headers vs Body
- [x] HTTP Methods
- [x] Status Codes
- [x] Cookies
- [x] Sessions
- [x] JWT
- [x] DNS
- [x] TCP
- [x] TLS / HTTPS
- [ ] UDP
- [ ] HTTP/2
- [ ] HTTP/3 (Overview)
- [ ] gRPC
- [ ] WebSockets
- [ ] Long Polling
- [ ] Short Polling

## Components

- [x] Reverse Proxy
- [ ] Forward Proxy
- [ ] Web Server
- [ ] Application Server

## Practice

- [ ] Tiny HTTP Server
- [ ] Draw complete request lifecycle

---

# Phase 2 — Databases & Storage ✅

> Status: COMPLETED (Mostly)

## Relational Databases

- [x] Database Modeling
- [x] Normalization
- [x] Denormalization
- [x] Transactions (ACID)
- [x] Isolation Levels
- [x] Locking
- [x] Optimistic Locking
- [x] Pessimistic Locking

## Database Internals

- [x] Storage Pages
- [x] B+ Trees
- [x] WAL
- [x] MVCC
- [x] Query Planner
- [x] Indexes
- [x] Clustered vs Non Clustered Indexes

## Query Performance

- [x] EXPLAIN
- [x] Query Optimization
- [x] Covering Indexes
- [x] Composite Indexes

## Scaling

- [x] Replication
- [x] Read Replicas
- [x] Partitioning
- [x] Sharding
- [x] Pagination
- [x] Cursor Pagination

## NoSQL

- [x] Key Value
- [x] Document
- [x] Wide Column
- [x] Graph Database

## Storage

- [x] File Storage
- [x] Object Storage
- [x] Block Storage

## Practice

- [x] Design Instagram Database
- [x] Optimize slow SQL queries

---

# Phase 3 — Architecture Fundamentals

## Architectural Styles

- [x] Monolith
- [x] Modular Monolith
- [x] Microservices
- [x] Event Driven Architecture
- [x] Pub/Sub
- [x] Stateful Systems
- [x] Stateless Systems
- [x] Serverless

## Architecture Patterns

- [x] Layered Architecture
- [x] Clean Architecture
- [x] Hexagonal Architecture

## Practice

- [x] Convert Monolith into Microservices
- [x] Design modular monolith

---

# Phase 4 — Scalability

## Core Concepts

- [x] Vertical Scaling
- [x] Horizontal Scaling
- [x] Capacity Planning
- [x] Scalability Bottlenecks
- [x] Read Scaling
- [x] Write Scaling
- [x] Backpressure

## Practice

- [x] Scale Instagram from 100 users to 1 Billion users

---

# Phase 5 — Availability & Reliability

## Core Concepts

- [x] Availability
- [x] High Availability
- [x] Consistency
- [x] CAP Theorem
- [ ] Reliability
- [ ] Maintainability
- [ ] Fault Tolerance
- [ ] Durability

## Resilience Patterns

- [ ] Retries
- [ ] Timeouts
- [ ] Circuit Breaker
- [ ] Bulkhead
- [ ] Graceful Degradation

## Practice

- [ ] Find Single Points of Failure
- [ ] Design HA architecture

---

# Phase 6 — Core Distributed Components

## Load Balancing

- [ ] L4 vs L7
- [ ] Algorithms
- [ ] Sticky Sessions
- [ ] Health Checks
- [ ] Active / Active
- [ ] Active / Passive
- [ ] Consistent Hashing

## API Gateway

- [ ] Routing
- [ ] Authentication
- [ ] Authorization
- [ ] Request Forwarding
- [ ] Aggregation

## Service Discovery

- [ ] Static Discovery
- [ ] Dynamic Discovery

## Caching

- [ ] Cache Aside
- [ ] Write Through
- [ ] Write Back
- [ ] Distributed Cache
- [ ] Cache Stampede
- [ ] Cache Invalidation
- [ ] Cache Eviction Policies

## Redis

- [ ] Redis Basics
- [ ] Data Structures
- [ ] Redis in System Design

## CDN

- [ ] CDN
- [ ] Edge Caching

## Rate Limiting

- [ ] Fixed Window
- [ ] Sliding Window
- [ ] Token Bucket
- [ ] Leaky Bucket

## Message Queues

- [ ] Kafka
- [ ] RabbitMQ
- [ ] Dead Letter Queue

## Practical Project

- [ ] API Gateway

---

# Phase 7 — Distributed Systems

## Core Concepts

- [ ] Distributed Systems
- [ ] Distributed Locks
- [ ] Consensus
- [ ] Leader Election
- [ ] Clock Synchronization

## Transactions

- [ ] Distributed Transactions
- [ ] Saga Pattern
- [ ] Two Phase Commit

## Event Driven

- [ ] Event Sourcing
- [ ] CQRS
- [ ] Outbox Pattern
- [ ] Idempotency

## Delivery Guarantees

- [ ] Exactly Once
- [ ] At Least Once
- [ ] At Most Once

## Practice

- [ ] Order Processing System

---

# Phase 8 — Observability

## Logging

- [ ] Structured Logging
- [ ] Correlation IDs

## Monitoring

- [ ] Metrics
- [ ] Monitoring
- [ ] Alerting

## Tracing

- [ ] Distributed Tracing
- [ ] OpenTelemetry

## Tooling

- [ ] Prometheus
- [ ] Grafana

## Practice

- [ ] Instrument API Gateway

---

# Phase 9 — Security

## Authentication

- [ ] Authentication
- [ ] Authorization
- [ ] OAuth2
- [ ] OpenID Connect
- [ ] JWT

## Communication

- [ ] TLS
- [ ] API Keys
- [ ] Secrets Management

## Reliability

- [ ] SSDLC
- [ ] Disaster Recovery
- [ ] Backup Strategy

---

# Phase 10 — Performance & Cost

## Performance

- [ ] Latency
- [ ] Throughput
- [ ] Profiling
- [ ] Benchmarking

## Cost

- [ ] Capacity Estimation
- [ ] Cost Estimation
- [ ] Cost vs Performance

---

# Phase 11 — Deployment & Cloud

## Containers

- [ ] Docker Revision
- [ ] Docker Compose

## Kubernetes

- [ ] Pods
- [ ] Deployments
- [ ] Services
- [ ] Ingress

## Cloud

- [ ] Auto Scaling
- [ ] Managed Services
- [ ] Object Storage

---

# Phase 12 — High Level Design Practice

## Beginner

- [ ] URL Shortener
- [ ] Pastebin
- [ ] Notification Service
- [ ] Tiny Analytics

## Intermediate

- [ ] Chat Application
- [ ] News Feed
- [ ] Food Delivery
- [ ] Ride Sharing

## Advanced

- [ ] WhatsApp
- [ ] Uber
- [ ] Netflix
- [ ] YouTube
- [ ] Google Docs
- [ ] Stripe

---

# Phase 13 — Low Level Design

## Fundamentals

- [ ] OOP Revision
- [ ] Interfaces
- [ ] Modularity
- [ ] UML

## Principles

- [ ] SOLID
- [ ] DRY
- [ ] KISS
- [ ] YAGNI

## Design Patterns

### Creational

- [ ] Factory
- [ ] Abstract Factory
- [ ] Builder
- [ ] Prototype
- [ ] Singleton

### Structural

- [ ] Adapter
- [ ] Decorator
- [ ] Composite
- [ ] Facade
- [ ] Proxy

### Behavioral

- [ ] Strategy
- [ ] Observer
- [ ] Command
- [ ] State
- [ ] Chain of Responsibility
- [ ] Template Method
- [ ] Mediator
- [ ] Iterator

## UML

- [ ] Class Diagram
- [ ] Sequence Diagram
- [ ] Activity Diagram
- [ ] State Diagram

## Practice

### Easy

- [ ] Logger
- [ ] Cache
- [ ] ATM
- [ ] Library

### Medium

- [ ] Parking Lot
- [ ] Splitwise
- [ ] Hotel Booking
- [ ] Elevator

### Advanced

- [ ] Chess
- [ ] Airline Reservation
- [ ] Car Rental

---

# Phase 14 — Capstone Projects

- [ ] Production API Gateway
- [ ] Microservices E-Commerce
- [ ] Event Driven Notification System
- [ ] Distributed URL Shortener
- [ ] Real-Time Chat Backend
- [ ] Full Observability Stack

---

# Completion Criteria

A phase is complete only when all of the following are done:

- Theory understood
- Design principles explained
- Small implementation completed
- Design exercise solved
- Knowledge review passed
- Interview-style problem solved
