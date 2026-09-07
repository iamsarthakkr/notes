# System Design Mindset — Interview Phrases

## Defining System Design
"System design is about making calculated tradeoffs across 
components — how they interact, share data, behave under load, 
and recover from failure. It's less about algorithms and more 
about architecture decisions."

## Stating A Tradeoff
"I'm choosing [X] over [Y] because [reason], accepting the 
tradeoff of [cost]. Given [constraint], that's the right call here."

## HLD vs LLD
"At the HLD level I want to define components and interactions 
first — I'll go into class-level detail once we agree on the 
overall architecture."

## On Requirements
"Before I start, let me make sure I understand both the functional 
requirements — what the system needs to do — and the non-functional 
ones, like availability and latency targets, since those drive 
the architecture more than the features do."

## On Constraints
"Are there any constraints I should design around — budget, team 
size, legal requirements like data residency? Those affect the 
choices I'd make."
