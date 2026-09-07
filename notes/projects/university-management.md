# University Management System

## Project Snapshot

**One-line pitch:** A role-based university management backend where student and
instructor registration goes through an admin approval workflow, backed by
JWT authentication and a clean layered Spring Boot architecture — demonstrates
enterprise backend patterns: security, validation, exception handling, and testing.

**Tech stack:**

| Layer | Choice | Why |
|---|---|---|
| Language | Java 21 | Modern LTS — records, pattern matching, and virtual threads available for future use |
| Framework | Spring Boot 3 | Industry-standard, mirrors the target job stack directly |
| Web | Spring MVC | Standard synchronous REST for a CRUD-heavy admin/student domain — no need for reactive here |
| Persistence | Spring Data JPA + MySQL | Relational data (users, students, instructors, roles) with real referential integrity |
| Security | Spring Security + JWT | Stateless auth appropriate for a decoupled frontend, no server-side session storage to scale |
| Build | Maven | Standard, explicit dependency management |
| Frontend | Next.js, React, TypeScript | Type-safe consumer of the API, forces the backend API contract to be clean and stable |
| Testing | JUnit 5, Mockito, `@SpringBootTest`, `@DataJpaTest` | Layered testing strategy matching the layered architecture |

**Key architecture decisions:**

- **Layered architecture (Controller → Service → Repository)** with explicit
  DTOs, Mappers, Validators, a global exception handler, and dedicated
  security/config packages. Chosen over exposing entities directly so the API
  contract is decoupled from the JPA model — entity changes don't leak into
  API responses.
- **Registration is deferred, not immediate.** A user registering as a
  student/instructor does *not* immediately get a `Student`/`Instructor`
  record — they get a `User` in `PENDING` status. The domain record is only
  created once an admin approves. This was a deliberate modeling decision to
  keep "identity" (User) and "role-specific data" (Student/Instructor)
  separate until the role is actually granted.
- **`CurrentUserService`** centralizes "who is making this request" — exposes
  `getCurrentUser()` / `getCurrentStudent()` / `getCurrentInstructor()` so
  controllers/services never touch `SecurityContextHolder` directly. Keeps
  auth plumbing out of business logic.
- **`@PreAuthorize` at the route level** for role-based authorization
  (ADMIN/STUDENT/INSTRUCTOR), keeping authorization declarative and visible
  next to the endpoint definition rather than buried in service-layer if-checks.

## Technical Depth

**Most interesting technical challenge — the registration/approval workflow.**
The hard part wasn't the happy path, it was modeling the in-between state
correctly: a person can register, and until an admin acts, they have no
`Student`/`Instructor` identity at all — only a `User` with status `PENDING`.
This meant:
- The `User` entity needed a status field independent of its eventual role
  entity, since at registration time the role entity doesn't exist yet.
- Approval had to be transactional: create the `Student`/`Instructor` record
  and flip the `User` status to `APPROVED` atomically — a partial failure
  (record created, status not updated, or vice versa) would leave the system
  in an inconsistent, hard-to-detect state.
- Rejection needed to be a valid terminal state too, not just "delete the
  registration," so there's an audit trail of who was rejected and (implicitly)
  why the account never got downstream access.

**Security implementation (JWT + Spring Security) — how to explain it clearly:**
1. On login, credentials are validated against the stored (hashed) password;
   on success, a JWT is issued containing the user's identity and role claims.
2. The JWT is stateless — no server-side session store, so any instance of
   the app can validate a request without shared session state, which matters
   the moment you have more than one backend instance behind a load balancer.
3. A custom filter in the Spring Security filter chain intercepts each
   request, extracts and validates the JWT, and populates the
   `SecurityContext` before the request reaches the controller.
4. Authorization is then enforced declaratively via `@PreAuthorize` on
   controller methods, checking the role claim against what the endpoint
   requires.
- **The one-sentence version for an interview:** "Login issues a signed JWT
  carrying identity and role; a filter validates it per-request and populates
  the security context; `@PreAuthorize` then does role checks at the route
  level — so authentication and authorization are cleanly separated."

**Registration workflow — how to walk through it in an interview:**
1. User submits registration (student or instructor) → a `User` record is
   created with status `PENDING`. No `Student`/`Instructor` record exists yet.
2. Admin views pending registrations (protected by `@PreAuthorize("hasRole('ADMIN')")`).
3. Admin approves → in a single transaction, the corresponding `Student` or
   `Instructor` record is created and the `User` status is updated to `APPROVED`.
   Admin rejects → `User` status is updated to `REJECTED`, no role record is created.
4. Only `APPROVED` users can authenticate into their role-specific area of the app.
- Walk through it as a state machine (`PENDING → APPROVED | REJECTED`) — it
  reads clearly on a whiteboard and shows you think in terms of explicit
  states rather than boolean flags.

**Testing approach:**
- **Repository tests (`@DataJpaTest`)** — verify custom queries and entity
  relationships/constraints work against a real (in-memory) database, not mocks.
- **Integration tests (`@SpringBootTest`)** — cover the full admin approval
  workflow end-to-end: register → pending → admin approves/rejects → role
  record exists or doesn't, status is correct. This was intentional because
  the approval workflow is the riskiest piece of business logic — a unit
  test mocking the repository wouldn't catch a broken `@Transactional`
  boundary or a real constraint violation.
- **Security test utilities** — verify `@PreAuthorize` actually blocks
  unauthorized roles, not just that the happy path works.
- Why this mix: unit tests with Mockito for pure service logic, but the
  parts with real risk (persistence, transactions, security) get tested
  against real infrastructure, not mocks — mocked security/persistence tests
  can pass while the real thing is broken.

## Self-Awareness

**What I'd do differently now:**
- Move to Flyway migrations instead of relying on `ddl-auto=update` — fine
  for a learning project, but not how I'd want schema evolution handled if
  this had real users.
- Model the approval workflow more explicitly as a state machine (e.g. a
  dedicated enum-driven transition method) rather than status field mutation
  scattered across service methods — would make invalid transitions
  (e.g. approving an already-rejected user) impossible by construction rather
  than by an extra `if` check.
- Add pagination to the admin's "list pending registrations" endpoint from
  day one — worked fine at small scale but doesn't reflect real-world data volume.

**Known limitations / honest tradeoffs:**
- No refresh token flow yet — JWTs are issued with a fixed expiry and there's
  no rotation/revocation mechanism, which is a real gap for a production auth system.
- Planned features (Departments, Courses, Enrollments, Grades, Timetable,
  Notifications) aren't built yet — the current scope is identity, roles,
  and the approval workflow, not the full academic domain.
- Single-service, single-database — no consideration yet for what breaks at
  scale (this was a deliberate scope decision to focus on getting the core
  patterns right first).

## Interview Prep

**Q: Why layered architecture instead of something like hexagonal or feature-modular?**
A: For this domain size — a handful of entities and a fairly linear approval
workflow — layered kept things simple and matched the team-familiar Spring
Boot conventions. I'd move toward feature/domain modules if the entity count
and cross-cutting concerns grew (e.g. once Courses, Enrollments, and Grades
are added), but introducing that structure now would be premature for the
current scope.

**Q: Walk me through what happens when a student registers.**
A: [see Registration Workflow above] — emphasize the `PENDING` state and that
no `Student` record exists until approval.

**Q: How do you handle authentication vs authorization?**
A: JWT filter handles authentication (who is this), `@PreAuthorize` handles
authorization (what are they allowed to do) — kept as two separate concerns
in the filter chain vs. the controller layer.

**Q: What happens if the admin approval transaction fails halfway through?**
A: It's wrapped in a single `@Transactional` boundary, so either both the
role record creation and the status update commit, or neither does — no
window where a `User` is `APPROVED` but has no `Student`/`Instructor` record.

**Q: Why JWT instead of session-based auth?**
A: Statelessness — the frontend is a separate Next.js app, and I didn't want
to introduce a shared session store just to support horizontal scaling later.
Tradeoff is I don't get built-in revocation, which is a known gap (see limitations).

**Q: How did you test the security layer?**
A: Dedicated security test utilities plus integration tests that assert
`@PreAuthorize` actually rejects wrong-role requests, not just that
correct-role requests succeed — testing only the happy path would miss a
misconfigured annotation.

**Q: What was the hardest bug you hit building this?**
A: [TODO: fill in a specific real bug if you remember one — e.g. a case
where the transaction boundary or `CurrentUserService` context wasn't behaving
as expected — concrete bugs land much better in interviews than generic answers.]

**Q: How would this scale if the university had 100,000 students?**
A: The registration/approval workflow itself isn't the bottleneck — reads
(course listings, student lookups) would be. I'd add read replicas and
pagination first, and reconsider `ddl-auto=update` for proper migrations
well before that scale.

**Q: Why no Lombok?**
A: Keeps the entities and DTOs explicit — no hidden generated code to reason
about when debugging, and it matches how I want production Java to read.

**Q: What would you build next if you kept working on this?**
A: Departments and Courses, since Enrollments and Grades both depend on that
structure existing first — then a refresh token flow, since that's the
biggest real security gap right now.
