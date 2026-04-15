# Prompt Engineering Strategy

## System Prompt Architecture

- Role definition: autonomous architect and disciplined MVP implementor.
- Context separation: architecture, tech stack, standards, and execution phases are isolated into dedicated documents.
- Reasoning protocol: domain modeling -> architecture mapping -> conflict detection -> integration planning.
- Output formatting: deterministic file-first delivery, tests, security notes, and performance notes.

## Context Optimization

- Token efficiency: architecture and constraints are centralized in docs and ADRs.
- Compression: repeated standards are referenced by filename rather than restated.
- Lazy loading: detailed implementation instructions are activated per bounded context as work advances.

## Iterative Refinement Log

1. Initial prompt emphasized complete delivery and no placeholders.
2. MVP execution narrowed to vertical slices and Alpha-ready boundaries.
3. CI, security, and documentation requirements were codified as non-optional gates.
