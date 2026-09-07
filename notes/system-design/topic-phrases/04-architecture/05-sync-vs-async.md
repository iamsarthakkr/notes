# Sync vs Async — Interview Phrases

## One-Liners
"Synchronous: the caller blocks and waits for a response before
continuing."
"Asynchronous: the caller sends the request and moves on immediately,
handling the result later via a callback, event, or polling."

## The Core Tradeoff
"Sync is simpler — you get an immediate result and immediate error
feedback, but the caller's performance is coupled to the callee's.
Async decouples that, at the cost of harder debugging and more complex
error handling since a failure might surface much later."

## "How Do You Decide If a Call Should Be Sync or Async?" — Ready Answer
"I ask whether the caller needs the result before it can proceed or
respond to the user. If yes, it has to be sync — I can't respond
without that data. If the work is a consequence of the main action and
can happen after the user already has their response, it should be
async so it doesn't block the critical path."

## Example Pair
"Validating a payment before confirming an order has to be sync since
the user needs to know immediately if it failed, but sending the
confirmation email after should be async since nothing depends on it
finishing before the response goes out."

## Closing Summary
"Sync for the critical path, async for the consequences."
