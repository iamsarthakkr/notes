# Cookies, Sessions & JWT — Interview Phrases

## Defining Cookies and Why HttpOnly/SameSite Matter
"Cookies are small data the browser stores and auto-attaches to
matching requests. HttpOnly stops JavaScript from reading the
cookie, so an XSS injection can't steal the session token even if
it runs. SameSite controls whether the cookie is sent on cross-site
requests — that's what blocks CSRF, where another site tries to
ride your logged-in session to make requests on your behalf."

## Explaining the Session Scaling Problem and Solutions
"Sessions live server-side, so if a session is created on one
server and the load balancer routes the next request to a different
one, that server doesn't know the session exists. Sticky sessions
fix it by always routing a client to the same server, but then a
server crash wipes out every session it held and load gets uneven.
The alternative is a shared store like Redis — any server can look
up any session, so servers stay interchangeable and sessions survive
a restart."

## Defining JWT and Why Statelessness Matters
"A JWT is a signed token that carries the user's claims directly —
user id, roles, expiry — so the server can verify a request without
looking anything up in a database. That's what makes it scale well:
any server can validate any token independently, no shared session
store required. The tradeoff is the payload is only signed, not
encrypted — anyone with the token can read the claims in plain text."

## JWT Revocation — Which Strategy and When
"It depends how urgently you need to revoke. If normal logout is
enough, short-lived access tokens with a server-side refresh token
work — you revoke by deleting the refresh token and the access
token expires naturally within minutes. If you need instant
revocation — someone's account is compromised right now — you need
a blacklist keyed on the token's jti, checked on every request,
which does cost you a lookup. Rotating the signing key is the last
resort — it invalidates every token in the system and logs
everyone out."

## Session vs JWT — When to Choose Each
"I'd reach for sessions when I control the whole backend and want
instant revocation — banking, admin panels, anything where 'log
this user out right now' has to actually work. I'd reach for JWT
for stateless, multi-service auth — mobile clients, microservices
validating tokens independently without hitting a shared session
store on every call — accepting that revocation gets harder in
exchange for that independence."

## One-Liner
"Sessions keep state on the server and pay for it in a shared store
or sticky routing; JWT keeps state on the client and pays for it in
revocation — pick based on which cost you can actually afford."
