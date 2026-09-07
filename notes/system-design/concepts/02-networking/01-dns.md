# DNS — Domain Name System

## What It Is
Distributed directory that maps human-readable domain names
to machine-readable IP addresses.
Core question: "Which IP should I send this request to?"

Example: example.com → 93.104.216.314

## DNS Record Types
- A Record — maps domain to IPv4 address
- CNAME Record — maps one domain to another domain

## DNS Lookup Flow
When you type example.com in a browser:
1. Browser cache — recently resolved? Use it (based on TTL)
2. OS cache — check local DNS cache
3. Recursive resolver — ISP or public DNS (8.8.8.8)
4. Root DNS server — knows where TLD servers are
5. TLD server (.com) — knows where authoritative server is
6. Authoritative DNS server — has the actual A record

## TTL (Time To Live)
Controls how long a DNS response is cached.
- Short TTL → faster change propagation, more DNS queries
- Long TTL → fewer queries, faster lookups, slower failover

## DNS Caching — Why It Matters
Benefits:
- Faster lookups (served from cache)
- Enables geographic routing — different IPs per region
- Multiple IPs for same domain → primitive load balancing

Danger:
- TTL delays recovery during failures
- Old IPs cached even after server change
- Fix: lower TTL before migrations, raise after

## DNS in System Design
Typical flow:
DNS → Load Balancer IP → Server

Not true load balancing — client picks from DNS response,
no health awareness. Real LB sits behind DNS.

## Connected To
- 07-reverse-proxy-load-balancer-api-gateway.md
- 05-tls-https.md
