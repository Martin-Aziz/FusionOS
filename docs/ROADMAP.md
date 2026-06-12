# FusionOS Delivery Roadmap

## Alpha 1 — Compatibility Intelligence (Current)

- Compatibility registry API (Rust/Axum)
- 10-app seed dataset with honest compatibility ratings
- Runtime route labels, known issues, hardware notes
- Community report submission
- Runtime resolver endpoint
- Web frontend: homepage, registry browser, app detail, runtime router explainer, workspace management UI
- Agent workspace API contracts (stub execution)
- Docker single-container deployment (Rust + React)

## Alpha 2 — Managed Runtime Environments

- Persistent storage: PostgreSQL adapter replacing in-memory repository
- Wine/Proton prefix management: install logs, known fix scripts, diagnostics
- Report submission improvements: hardware auto-detection, version validation
- Registry expansion: 50+ apps with community contributions
- macOS experimental route: early research integration (marked clearly as experimental)
- USB offline installer update for Rust binary

## Alpha 3 — Agent Workspaces

- Real agent workspace execution engine
- Filesystem sandboxing (Linux namespaces / seccomp)
- Network access control (nftables / eBPF)
- Execution log streaming
- Workspace rollback state
- Agent runtime access: native-linux, container, and python-env routes

## Beta — Community Compatibility Database

- Public app registry with community-submitted entries
- Verified maintainer roles
- Hardware profile matching
- App voting and trust scores
- Community fix scripts with verification
- Authentication: device tokens, optional accounts
- Game compatibility matrix expansion

## Long-term Research

- macOS compatibility path (XNU syscall translation — research only, no timeline)
- ARM / RISC-V builds
- Custom microkernel investigation (post-Beta)
- GUI OS installer
