# Saga Pattern Basics — Interview Phrases

## One-Liner — Saga
"A saga is a sequence of local transactions across services, where
each step has a compensating action that undoes it if a later step
fails."

## One-Liners — Coordination Styles
"Choreography: services react to each other's events with no central
coordinator."
"Orchestration: a central coordinator explicitly calls each service in
sequence and decides what happens next."

## Order/Inventory/Payment Example
"Placing an order reserves inventory, then charges payment as separate
local transactions. If the payment step fails, the saga runs
compensating actions in reverse — releasing the reserved inventory and
cancelling the order — rather than rolling everything back atomically."

## "How Would You Handle a Distributed Transaction Across Microservices?" — Ready Answer
"I'd use the Saga pattern — break the operation into a sequence of
local transactions, one per service, each with a compensating action
to undo it if a later step fails. For a few simple steps I'd let
services coordinate via events (choreography); for a more complex flow
I'd use a central orchestrator so the whole sequence stays visible and
easy to debug."

## Closing Summary
"Sagas trade atomicity for eventual consistency via explicit
compensating actions, coordinated either by choreography or
orchestration."
