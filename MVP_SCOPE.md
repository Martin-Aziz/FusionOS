# TriOS MVP Scope (Alpha)

## Included

1. TriPKG Registry API foundation with search, details, compatibility submission, telemetry intake.
2. Security and observability baseline: Helmet, rate limits, JSON logs, request IDs, `/health`, `/metrics`.
3. Strict TypeScript monorepo scaffold following DDD-oriented directory boundaries.
4. CI pipeline with typecheck, lint, tests, audit, and build gates.
5. Dockerized local stack: app, PostgreSQL, Redis, reverse proxy.

## Excluded

1. Full macOS compatibility implementation.
2. Custom microkernel replacement.
3. ARM and RISC-V support.
4. GUI app store.
5. Advanced GPU translation and anti-cheat driver compatibility.

## Success Criteria

1. `docker-compose up` starts all services and `GET /health` is reachable.
2. Core API endpoints validate and return deterministic responses.
3. Tests run in CI with strict quality gates.
4. Architecture decisions and scope assumptions are documented and versioned.
