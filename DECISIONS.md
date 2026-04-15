# Implementation Decisions and Assumptions

## Assumptions Made

1. Linux kernel-based host runtime is the Alpha foundation.
   - Rationale: fastest path to hardware compatibility and ecosystem adoption.
   - Alternative considered: custom microkernel first.
   - If wrong: isolate host-runtime contracts and migrate behind adapter boundaries defined in `docs/adr/ADR-001-kernel-base.md`.

2. WinEnv is prioritized over macEnv in Alpha.
   - Rationale: highest user demand and stronger existing compatibility tooling.
   - Alternative considered: split parallel investment between WinEnv and macEnv.
   - If wrong: rebalance via ADR update and move macEnv adapter into Phase 1.5.

3. TriPKG ships as CLI-first for Alpha.
   - Rationale: fastest vertical slice with lower UI complexity.
   - Alternative considered: GUI-first app store.
   - If wrong: backend contracts remain stable while adding GUI in frontend bounded context.

4. Telemetry remains strictly opt-in.
   - Rationale: privacy-first positioning and trust-building.
   - Alternative considered: default-on anonymous telemetry.
   - If wrong: evaluate adoption impact with explicit user governance vote.

## Technology Choices

| Decision | Alternatives Considered | Rationale | Migration Path |
|---|---|---|---|
| Node.js 20 + Express 4 backend | Fastify, NestJS | fast MVP iteration, mature middleware ecosystem | Service boundaries allow framework migration |
| TypeScript strict mode | JavaScript | stronger safety at system boundaries | N/A |
| In-memory repository for initial vertical slice | PostgreSQL first | ship contracts and tests before persistence complexity | replace repository implementation with Postgres-backed adapter |
| Prometheus metrics + pino JSON logs | OpenTelemetry-only initial stack | simple, production-proven baseline | add OTEL exporters in next phase |

## Deviations with Justification

1. Initial persistence is in-memory rather than PostgreSQL.
   - Justification: prioritize contract-valid vertical slice and CI signal first.
   - Guardrail: repository interface already isolates storage concerns.

2. No auth token issuance endpoints in this first commit.
   - Justification: current endpoints are public registry contracts and telemetry intake.
   - Guardrail: rate limiting and payload validation already active.

## Known Technical Debt (Prioritized)

1. High: Replace in-memory registry with PostgreSQL + Redis implementations.
2. High: Add JWT access/refresh token issuance and rotation endpoints.
3. Medium: Add OpenAPI generation and schema-driven contract tests.
4. Medium: Add mutation tests for route/service critical paths.
5. Medium: Add macEnv route contracts and compatibility scoring policy refinement.
