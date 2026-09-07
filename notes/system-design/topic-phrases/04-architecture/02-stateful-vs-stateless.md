# Stateful vs Stateless — Interview Phrases

## One-Liners
"Stateless: no server instance holds client-specific data between
requests — everything needed comes with the request or gets fetched
from an external store."
"Stateful: the server holds client-specific data in memory, tied to
that one instance — a login session or an open connection."
"Externalized state: keep the server stateless, but move what would
be in-memory state into a shared external store like Redis or a DB."

## Why Stateless Scales More Easily
"Since no server holds context that only it knows about, any instance
can handle any request. That's what makes horizontal scaling and load
balancing trivial — there's no need for a request to find its way back
to one specific server."

## "How Would You Scale a System That Stores Sessions in Server Memory?" — Ready Answer
"Move session data out of server memory and into Redis. Each request
carries a session ID, the server looks up the session in Redis instead
of relying on local memory, and now any instance can serve any
request — no sticky sessions needed, and a server dying doesn't lose
anyone's session."

## WebSockets — The Exception
"WebSockets are a genuine exception to keeping things stateless — the
connection itself is physically tied to one server instance and can't
be externalized the way session data can."

## Closing Summary
"Stateless doesn't mean no state exists — it means the server instance
doesn't privately hold it."
