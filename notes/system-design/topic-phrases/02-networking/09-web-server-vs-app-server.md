# Web Server vs Application Server — Interview Phrases

## Defining the Distinction
"A web server handles the HTTP layer — static files, TLS
termination, reverse proxying, connection handling — and is
optimized for I/O, holding open lots of concurrent connections
cheaply. An application server executes the actual business logic
and is optimized for CPU and memory, not connection volume. Nginx is
a web server; Tomcat is an application server."

## How They Work Together in a Typical Deployment
"The usual flow is client to Nginx to Tomcat to the database. Nginx
terminates TLS and serves static content directly without touching
the app server at all. Only requests that actually need business
logic get forwarded to Tomcat, so the app server's compute is spent
on the work that actually needs it."

## Spring Boot Context
"Spring Boot ships with an embedded Tomcat, so the application
server is bundled directly into the jar — there's no separate Tomcat
install to manage. That doesn't remove the need for a web server in
front though; I'd still put Nginx or an ALB ahead of it for TLS
termination and to keep the app server from facing raw internet
traffic directly."

## When the Distinction Matters in System Design
"It matters when I need to scale the two tiers independently — more
Nginx instances for connection volume and static traffic, more
Tomcat instances for compute-heavy business logic. It also matters
for the security boundary: the web server is the thing actually
exposed to the internet, absorbing malformed requests and slow
clients before anything reaches application code."

## One-Liner
"Web server handles the connection and the bytes; application
server handles what the bytes mean — and Spring Boot bundles the
second one for you while still expecting you to put the first one in front."
