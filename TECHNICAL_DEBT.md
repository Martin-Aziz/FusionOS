# Technical Debt Register

## High Priority

1. Persistence hardening
   - Current state: in-memory repository.
   - Impact: data loss on restart, no transactional guarantees.
   - Resolution path: implement Postgres repositories and Redis-backed cache adapters.

2. Authentication flows
   - Current state: no JWT issuance and rotation endpoints.
   - Impact: no authenticated device lifecycle management.
   - Resolution path: add `/auth/login`, `/auth/refresh`, `/auth/logout` with secure cookies.

3. Compatibility execution adapters
   - Current state: contracts exist but no real install orchestration.
   - Impact: no real package execution.
   - Resolution path: build WinEnv and Linux adapters with checksum and rollback semantics.

## Medium Priority

1. Mutation testing
   - Current state: standard tests only.
   - Impact: reduced confidence against assertion weakness.
   - Resolution path: introduce mutation tooling for service and validation modules.

2. OpenAPI docs generation
   - Current state: manual API documentation.
   - Impact: potential drift from implementation.
   - Resolution path: source OpenAPI from Zod schemas and route metadata.

3. Frontend bounded context implementation
   - Current state: directory scaffold only.
   - Impact: no user-facing store or dashboard yet.
   - Resolution path: ship React-based app store and admin compatibility dashboard.
