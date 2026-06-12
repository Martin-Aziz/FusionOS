# FusionOS Architecture

## System Overview

FusionOS is a compatibility-first Linux-based OS with a Rust backend API, React web frontend, and an in-memory compatibility registry. The architecture is contract-first: shared domain types define the data model, and both the backend and frontend agree on these contracts.

## Tech Stack

| Layer | Technology |
|---|---|
| API Server | Rust (Axum 0.7, Tokio 1) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Shared types | TypeScript (common/types/domain.ts) |
| Storage (Alpha) | In-memory (Rust Mutex-guarded Vec) |
| Storage (Beta) | PostgreSQL (planned) |
| Cache | In-memory TTL cache (15s for search) |
| Observability | Prometheus metrics, tracing-subscriber JSON logs |
| Proxy | Nginx (production), Vite proxy (dev) |

## Bounded Contexts

### 1. Compatibility Registry

The core of FusionOS Alpha. A searchable database of apps with:
- `AppCompatibilityRecord` — name, slug, category, compatibilityLevel, runtimeRoute, knownIssues, gameSupport, installAction
- `CompatibilityReport` — community-submitted reports with systemProfile, runtimeRoute, worked, notes
- Search: substring match on name/description, filters by category/level/route, 15s cache

### 2. Runtime Router

Maps apps to execution paths. Given an `appSlug` and `SystemProfile`, returns:
- `recommendedRoute` — best execution path
- `alternativeRoutes` — fallback options
- `rationale` — human-readable explanation
- `riskLevel` — low/medium/high
- `knownIssues` — relevant issues for this route

Route hierarchy: native-linux > flatpak/appimage/apt > wine > proton > container > vm > agent-workspace > macos-experimental

### 3. Agent Workspaces

Isolated execution environments (Alpha API, execution engine in Alpha 3):
- Controlled filesystem access (`allowedPaths`)
- Network permission levels: none / limited / full
- Status: idle / running / failed / stopped
- Runtime access: any subset of RuntimeRoute

### 4. Host Runtime

Linux kernel foundation. FusionOS ships on a standard Linux base (kernel ≥6.1). Hardware interface and driver assumptions are isolated behind runtime contracts. Custom microkernel is out of scope for Alpha.

### 5. Build and Release

- Docker multi-stage build: Rust binary + React dist bundled into single container
- Nginx reverse proxy for production deployments
- USB offline installer scripts for air-gapped environments

## Data Flow

```
Browser → Vite (dev) OR Nginx (prod)
         → Axum API server (:4000)
           → Handler (validates JSON via serde)
           → Repository (InMemoryRepository)
             → Returns AppCompatibilityRecord / CompatibilityReport / etc.
         ← JSON response with X-Request-ID header
```

## Key Design Decisions

- **Rust for backend**: performance, memory safety, single binary deployment, no Node.js runtime required on target machine.
- **In-memory storage for Alpha**: no database dependency to install. Seed data embedded at compile time via `include_str!`. Postgres adapter is the next planned migration.
- **Single container deployment**: Rust binary serves React static files in production. Simplifies USB offline installation.
- **Shared TypeScript types**: `common/types/domain.ts` is the source of truth for domain shapes. Frontend imports these directly. Rust models mirror them independently with serde.
- **macOS route is explicitly experimental**: not a feature, not a promise. Listed for transparency so users know it's a research path.
