# Vertical vs Horizontal Scaling

## Vertical Scaling
Vertical scaling means making one machine more powerful — more CPU,
more RAM, more disk — instead of adding more machines to handle load.

It's usually the first scaling move for a reason: it's extremely
simple, requires no architectural changes, and needs no data
partitioning. You just buy a bigger box.

The analogy: one kitchen, buy a bigger stove, hire a better chef —
it's still one kitchen, just a more capable one.

This is genuinely enough when you have one server, a small user
base, and a low number of requests/sec — there's no reason to reach
for anything more complex.

**Advantages**
- Extremely simple — no architectural changes needed
- No data partitioning required
- Fast to do — upgrade hardware, done

**Disadvantages**
- Hard hardware ceiling — you can't keep upgrading a single machine
  forever
- Remains a single point of failure — one machine, one outage away
  from total downtime
- Upgrading hardware gets expensive fast, and cost stops scaling
  linearly — the next tier of hardware costs disproportionately more
  for the extra capacity it gives you

It stops being viable once traffic grows past what any single
machine can handle, no matter how much money you throw at it.

## Horizontal Scaling
Horizontal scaling means adding more machines to handle growing
load, with traffic distributed across them by a load balancer.

Why it's more powerful long-term: unlike vertical scaling, there's
no hard ceiling on the number of servers you can add.

The mechanics: a load balancer decides how to route each incoming
request across the pool of servers, and each server ends up handling
roughly 1/N of the total load.

**Advantages**
- No hard ceiling on capacity — keep adding machines as load grows
- No single point of failure — one server going down doesn't take
  the whole system with it
- Cost scales more predictably with capacity added

**Disadvantages**
- Not free — it trades hardware simplicity for a new set of
  distributed-systems problems (see below)

## Problems Horizontal Scaling Introduces
This is the part worth dwelling on — horizontal scaling isn't a free
win, it just moves the hard problems elsewhere.

- **Stateful sessions become difficult.** If a user's session lives
  on server 1 and their next request lands on server 2, that session
  isn't found. This needs a shared/distributed cache (e.g. Redis) to
  hold session state across all servers instead of pinning state to
  one machine.
- **The shared DB becomes the next bottleneck.** App servers scale
  out fine, but they usually still share one database — so the DB
  still has to serve all requests regardless of how many app servers
  sit in front of it.
- **Data consistency gets harder.** Multiple servers hitting the same
  DB concurrently means distributed transactions, locking, and
  optimistic concurrency all become real problems instead of
  theoretical ones (see [[03-transactions-acid]] and
  [[04-isolation-levels-locking]]).
- **Network latency increases.** Server-to-server and
  server-to-database hops introduce latency, timeouts, and partial
  failures that simply don't exist in a single-machine setup.

## When to Reach for Horizontal Scaling
- One machine's limit has actually been reached
- You need high availability, not just more throughput — redundancy
  matters, not just capacity
- You need more control over where and how services run
- You need higher throughput than any single machine could ever give
  you

## The Tradeoff
Vertical scaling buys simplicity now, at the cost of a hard ceiling
and a single point of failure later. Horizontal scaling removes that
ceiling, but trades away simplicity — statefulness, consistency, and
network reliability become problems you now have to solve yourself.

This is exactly why later scalability topics — caching, read
replicas, sharding — exist: they're the answers to the problems
horizontal scaling creates. Horizontal scaling doesn't come with
those answers built in.

## Comparison Table

| Property | Vertical Scaling | Horizontal Scaling |
|---|---|---|
| Ceiling | Hard hardware ceiling | No hard ceiling |
| Single point of failure | Yes | No |
| Cost curve | Gets expensive fast, non-linear | More predictable per unit of capacity |
| Architectural complexity | None — same machine, no changes | High — LB, shared state, consistency |
| Data consistency | Not an issue — one machine | Becomes a real problem to solve |
| Session/state handling | Trivial — lives on one machine | Needs shared/distributed cache |
| Best for | Early stage, small load, simplicity | Growth stage, HA needs, high throughput |
