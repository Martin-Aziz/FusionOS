# ADR-002: WinEnv Integration Strategy

## Status

Accepted

## Context

Windows compatibility is a primary user value driver, but full clean-room implementation is too slow for Alpha.

## Decision

Adopt adapter-driven WinEnv integration first, with compatibility services abstracted behind interfaces for deeper replacement over time.

## Consequences

- Positive: faster delivery of practical app compatibility path.
- Negative: dependency on external compatibility stack behavior in early releases.
