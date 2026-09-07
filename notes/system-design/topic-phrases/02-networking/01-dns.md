# DNS — Interview Phrases

## Defining It
"DNS is a distributed directory that translates domain names
to IP addresses — the question it answers is which IP should
this request go to."

## TTL Tradeoff
"TTL controls how long DNS responses are cached — longer TTL
means faster lookups but slower recovery during failures.
Before any migration I'd lower the TTL first, then change
the record, then raise it again."

## DNS in Design
"DNS resolves to my load balancer IP — DNS itself isn't doing
load balancing in any meaningful sense, the LB behind it is."

## One-Liner
"DNS is just a phone book — the interesting design decisions
start after it resolves to your load balancer."
