# ADR-001: Linux Kernel Base for Alpha

## Status

Accepted

## Context

TriOS requires broad hardware compatibility early. A custom microkernel-first approach is strategically attractive but significantly delays ecosystem adoption.

## Decision

Alpha will assume a Linux-kernel-based host runtime and isolate runtime contracts so future kernel strategy can evolve.

## Consequences

- Positive: immediate leverage of mature driver ecosystem and tooling.
- Negative: custom microkernel vision deferred and requires migration plan.
