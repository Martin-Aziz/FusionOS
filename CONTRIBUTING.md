# Contributing Guide

## Workflow

1. Create feature branches from `main`.
2. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`).
3. Keep changes scoped and architecture-aligned by bounded context.

## Quality Gates

Before opening a pull request:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## Review Expectations

1. Prefer small, intention-revealing functions.
2. Add tests for happy path, edge cases, and error paths.
3. Update decision docs when assumptions change.
