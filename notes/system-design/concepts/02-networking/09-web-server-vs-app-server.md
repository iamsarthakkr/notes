# Web Server vs Application Server

## Web Server
Receives HTTP requests and serves content as efficiently as
possible. It doesn't know or care about your business logic — its
job is handling the connection and the raw HTTP layer.

Primary responsibilities:
- Serving static files (HTML, JS, CSS, images)
- Handling raw HTTP traffic — parsing requests, managing connections
- TLS termination
- Reverse proxying to backend services
- Caching
- Compression
- Rate limiting

Examples: Nginx, Apache HTTP Server

Optimized for: I/O-bound work — holding open thousands of
concurrent connections cheaply. Nginx's event-loop model handles
this without spinning up a heavyweight thread per connection, which
is exactly why it sits at the edge instead of your app code.

## Application Server
Executes the actual business and application logic — the code you
wrote.

Primary responsibilities:
- Running your application code
- Applying business rules
- Connecting to databases and external services

Examples: Tomcat, Jetty (Java)

Optimized for: CPU and memory — executing code, processing data,
running your business logic. It's not built to efficiently juggle
tens of thousands of idle keep-alive connections the way a web
server is; that's not the problem it's solving.

## How They Work Together
Typical flow:
```
Client → Nginx (TLS termination, static files) → Tomcat (business logic) → Database
```

The web server absorbs high connection concurrency and serves static
content directly, without ever bothering the app server. The app
server only gets invoked for requests that actually need business
logic — dynamic content, API calls, anything requiring a decision.

They scale independently: need to handle more concurrent
connections or more static traffic — add Nginx instances. Need more
compute for business logic — add Tomcat instances. Conflating the
two means you scale both together even when only one is the actual
bottleneck.

## Why the Separation Matters
- Web servers are extremely efficient at I/O — event-loop, often
  C-based, built specifically to handle massive connection counts
  cheaply. A JVM app server isn't built for that job and shouldn't
  be asked to do it
- App servers focus on business logic — the JVM runtime is built to
  execute code well, not to be the first thing facing raw internet traffic
- The web server acts as a shield — the app server never directly
  faces the open internet; the web server absorbs malformed
  requests, slow clients, and TLS overhead before anything reaches
  application code

In Spring Boot specifically: Tomcat is embedded — it ships inside
your jar, so the app server is bundled with your app rather than a
separate deployment. Nginx (or an equivalent) still sits in front,
handling TLS termination and reverse proxying, because embedding
Tomcat doesn't remove the need for a proper web-server layer at the edge.

## In Modern Deployments
Containers and cloud infra have blurred the historical line between
these two roles:
- A Spring Boot app with embedded Tomcat packages the app server
  directly inside the deployable artifact — there's no separately
  managed Tomcat install anymore
- Nginx, or a cloud load balancer (AWS ALB), still plays the
  web-server/LB role in front of it — TLS termination, routing,
  absorbing connection volume
- Static assets increasingly bypass both entirely — S3 + CloudFront
  serves them directly from a CDN edge location, so neither Nginx
  nor Tomcat ever sees that traffic at all
