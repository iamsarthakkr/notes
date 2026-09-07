# Storage Systems — Interview Phrases

## One-Line Definitions
"Block storage: raw fixed-size blocks exposed like a virtual hard
drive — no file concept until the OS's filesystem sits on top."
"File storage: a hierarchical files-and-folders structure, accessed
over a network protocol, shareable across multiple servers at once."
"Object storage: a flat namespace of objects addressed by key,
accessed over HTTP instead of filesystem operations."

## Core Tradeoff
"Block storage gives the lowest latency and the most control but the
least scale and shareability. Object storage flips that entirely —
massive scale and shareability, at the cost of random-write access
and higher per-request latency."

## "Where Would You Store User-Uploaded Images and Why" — Ready Answer
"Object storage — something like S3. Images are write-once-read-many,
they don't need in-place random writes, and I want virtually
unlimited capacity without managing a filesystem myself. It's also
naturally shareable across every app server without any special setup."

## Why Object Storage Doesn't Support In-Place Random Writes
"Object storage treats an object as a single opaque blob accessed via
HTTP, not a byte-addressable device — so updating it means replacing
the whole object, not writing a range of bytes in place like block storage does."

## One-Liner — Summary
"Real systems combine block storage for the database's own disks with
object storage for large binary assets — it's not an either/or choice,
they solve different problems side by side."
