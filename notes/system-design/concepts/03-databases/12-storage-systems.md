# Storage Systems

## Why This File Exists
Everything in Phase 2 so far has been about structured data living
in a database. This file is about where the rest of the data
actually lives — files, images, videos, backups, logs — and the
three fundamental storage models used to hold it. This closes out
Phase 2.

## Block Storage
Storage exposed as raw, fixed-size blocks — like a virtual hard
drive attached to a server. There's no concept of a "file" at this
layer at all, just addressable blocks; the OS and its filesystem sit
on top and organize those blocks into files and directories.

**Why**: lowest-level, fastest, most flexible — the OS controls the
filesystem entirely, and supports genuine random read/write access at
the block level with minimal overhead in between.

**Use cases**: database storage volumes — the actual disks a
database writes its pages to ([[06-database-internals]]); boot
volumes for VMs.

**Example**: AWS EBS, a mounted disk on a VPS.

**Limitation**: typically tied to a single server/instance — not
natively shared across many machines at once — and you're
responsible for managing the filesystem on top of it yourself.

## File Storage
Storage organized as a hierarchical structure of files and folders,
accessed via standard file operations (read, write, list directory)
— usually over a network protocol like NFS or SMB.

**Why**: the familiar file/folder abstraction, and — unlike typical
block storage — it can be shared across multiple servers
simultaneously, all reading and writing the same files and
directories at once.

**Use cases**: shared config files, a shared uploads directory across
multiple app servers, legacy applications that expect a real
filesystem underneath them.

**Example**: AWS EFS, an NFS mount.

**Limitation**: doesn't scale as well as object storage for massive
numbers of files — directory listing performance in particular
degrades once a directory holds a huge number of entries.

## Object Storage
Storage organized as a flat namespace of objects, each identified by
a unique key, accessed via an HTTP API rather than filesystem
operations. There are no real directories — "folders" are just a
convention of key prefixes (`images/2024/photo.jpg` is one key, not a
nested path the storage system actually traverses).

**Why**: built for massive horizontal scale from the start — with no
filesystem hierarchy to maintain, it can distribute objects across
huge numbers of nodes trivially, giving virtually unlimited capacity.

**Use cases**: user-uploaded images/videos, static assets, backups,
data lake storage — anything write-once-read-many at scale.

**Example**: AWS S3.

**Limitation**: no random byte-range writes to an existing object —
objects are typically replaced wholesale, not edited in place; higher
latency per request than block storage, since every access goes over
HTTP rather than a direct block-level interface; some object storage
systems have historically offered only eventual consistency rather
than immediate read-after-write consistency (worth knowing exists,
not a deep dive here).

## Choosing Between Them
- Need a database or VM to have a real attached disk with
  low-latency random I/O? → block storage
- Need multiple servers to share a real filesystem with folder
  semantics? → file storage
- Storing large binary blobs (images, videos, backups) accessed via
  API, needing massive scale? → object storage

These aren't competing choices in most real systems — a typical
architecture uses block storage for the database's own disks *and*
object storage for user uploads/static assets, at the same time,
because they're solving different problems.

## The Core Tradeoff
Block storage gives the lowest latency and the most control, at the
cost of the least scale and shareability. Object storage gives
massive scale and shareability, at the cost of giving up random-write
access and adding per-request latency. File storage sits in
between — familiar semantics and real shareability across servers,
but scales worse than object storage once file counts get extreme.

## Comparison Table

| | Block Storage | File Storage | Object Storage |
|---|---|---|---|
| Access method | Raw blocks, via the OS/filesystem | File operations (read/write/list) over a network protocol | HTTP API, key-based |
| Scalability | Limited — tied to one server/instance | Moderate — degrades at huge file counts | Very high — built for massive scale from the start |
| Typical latency | Lowest | Medium | Highest (per request) |
| Shareable across servers | Typically no | Yes | Yes |
| Best-fit use case | DB disks, VM boot volumes | Shared uploads/config across app servers | User uploads, static assets, backups, data lakes |
