# HTTP Methods & Status Codes — Interview Phrases

## Explaining Idempotency of Methods
"GET, PUT, and DELETE are idempotent — running them N times leaves
the system in the same state as running them once. DELETE is
idempotent because 'make sure this is gone' run twice still leaves
it gone, even if the second call returns 404 instead of 200. POST
isn't idempotent because each call typically creates a new resource.
PATCH depends on the update — setting an absolute value is
idempotent, but a delta like 'increment by one' isn't, since running
it twice changes the result twice."

## 401 vs 403
"401 means the server doesn't know who you are — no or invalid
credentials, and retrying with auth would fix it. 403 means it
knows exactly who you are and you're still not allowed — retrying
with the same credentials will never succeed, you'd need different
permissions entirely."

## 502 vs 503 vs 504
"All three mean the upstream failed, but the shape of the failure
is different. 502 is the upstream responding with garbage — it's
alive but broke mid-response. 503 is the upstream deliberately
refusing traffic — overloaded, shedding load, or mid-deploy. 504 is
the upstream just never responding before the gateway's timeout
fires. I'd want the distinction in monitoring because 502 usually
points at a bug, 503 at capacity, and 504 at latency."

## When 409 vs 422
"409 is a state conflict — the request is well-formed but clashes
with what's currently stored, like two clients editing the same
record or a unique constraint hit. 422 is a payload problem —
the request is semantically invalid no matter what state the server
is in, like an end date before a start date."

## Returning Correct Status Codes in API Design
"I try to make status codes carry enough information that a client
can decide what to do without parsing the body — a 401 means retry
with credentials, a 403 means don't retry at all, a 429 means back
off using Retry-After. Getting this wrong pushes that decision logic
into ad hoc string-matching on error messages, which breaks the
first time the message copy changes."

## One-Liner
"Idempotency tells you what's safe to retry, and status codes tell
the client why something failed and whether retrying will help —
get both right and clients can react correctly without guessing."
