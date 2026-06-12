# FusionOS

**One open system for every runtime world.**

FusionOS is an open-source Linux-based operating system and compatibility management layer. It helps users run Linux-native apps, Windows applications, games, developer tools, and isolated AI-agent workspaces from one managed environment.

> **Alpha status.** FusionOS is in active development. The compatibility registry, runtime router, and web interface are functional. Agent workspace execution and Windows install automation are planned for Alpha 2–3.

---

## What FusionOS Is

- A **compatibility-first Linux-based OS** — Linux is the host, Windows apps run through Wine/Proton.
- A **searchable compatibility registry** — look up any app, see its runtime route, compatibility level, known issues, and community reports before you install.
- A **runtime router** — the system maps apps to the best execution path: native Linux, Flatpak, AppImage, Wine, Proton, container, VM, or agent workspace.
- A **community reporting layer** — users submit what worked, on what hardware, through which route.

## What FusionOS Is Not

- Not a magic "run every app from every OS" solution.
- Not a macOS replacement. macOS compatibility is **experimental / future research** — it is not an Alpha promise.
- Not a Windows replacement. Windows apps run through Wine/Proton compatibility layers, not natively.
- Not claiming perfect game compatibility. Anti-cheat kernel modules that require Windows are flagged clearly as blockers.
- Not a finished product. Alpha focuses on the registry, routing, and reporting layer.

---

## Core Pillars

| Pillar | Status |
|---|---|
| Linux Host Runtime | Supported |
| Compatibility Registry | Alpha — 10+ apps seeded |
| Runtime Router | Alpha — route labels and guidance |
| Windows App Compatibility (Wine/Proton) | Alpha — contracts and guidance |
| Game Support | Alpha — Proton routes, anti-cheat flags |
| Agent Workspaces | Alpha API contracts — execution engine in Alpha 3 |
| macOS Compatibility | Experimental research — not Alpha |

---

## Runtime Routes

| Route | Description |
|---|---|
| `native-linux` | Direct Linux binary — best performance |
| `flatpak` | Sandboxed cross-distro package |
| `appimage` | Portable binary, no install required |
| `apt` | System package manager |
| `wine` | Windows binary compatibility layer |
| `proton` | Steam's Wine fork with DX translation for games |
| `container` | Docker/Podman isolated container |
| `vm` | Full virtual machine for maximum compatibility |
| `agent-workspace` | Isolated FusionOS workspace (Alpha 3) |
| `macos-experimental` | Research path — not production ready |

---

## Repository Layout

```
FusionOS/
├── backend-rust/        ← Rust backend (Axum + Tokio) — primary API server
├── frontend/            ← React + TypeScript + Vite web interface
├── backend/             ← Legacy Node.js backend (reference only)
├── common/
│   ├── types/domain.ts  ← Shared TypeScript domain types
│   ├── schemas/registry.ts ← Zod validation schemas (frontend)
│   └── data/compatibility-registry.seed.json ← 10-app seed data
├── docs/                ← Architecture, roadmap, ADRs
├── infra/nginx/         ← Nginx reverse proxy config
├── scripts/             ← USB portable build scripts
├── docker-compose.yml   ← Local stack: Rust app + Postgres + Redis + Nginx
└── Dockerfile           ← Multi-stage: Rust build + React build + runtime
```

---

## Getting Started

### Prerequisites

- **Rust** 1.78+ (`rustup.rs`)
- **Node.js** 20+ and npm

### Run the Rust backend

```bash
cp .env.example .env
cd backend-rust
cargo run
# Server starts at http://localhost:4000
```

### Run the frontend dev server

```bash
npm install
npm run dev:frontend
# UI at http://localhost:5173 (proxies /api to :4000)
```

### Docker (full stack)

```bash
cp .env.example .env
docker-compose up --build
# App: http://localhost:8080
```

---

## API Quick Reference

```bash
# Health
curl http://localhost:4000/health

# Search apps
curl "http://localhost:4000/api/v1/apps/search?q=steam"

# Browse all apps
curl "http://localhost:4000/api/v1/apps/search"

# App detail
curl http://localhost:4000/api/v1/apps/vscode

# Compatibility reports
curl http://localhost:4000/api/v1/apps/photoshop/compatibility

# Submit a report
curl -X POST http://localhost:4000/api/v1/apps/steam/reports \
  -H "Content-Type: application/json" \
  -d '{"runtimeRoute":"native-linux","worked":true,"systemProfile":{"arch":"x86_64","ramGb":8,"fusionOsVersion":"0.1.0"},"notes":"Worked perfectly"}'

# Resolve runtime route
curl -X POST http://localhost:4000/api/v1/runtime/resolve \
  -H "Content-Type: application/json" \
  -d '{"appSlug":"photoshop","systemProfile":{"arch":"x86_64","ramGb":8,"fusionOsVersion":"0.1.0"}}'

# Workspaces
curl http://localhost:4000/api/v1/workspaces
```

---

## Build

```bash
npm run build          # Build frontend
npm run build:rust     # Build Rust backend
npm run typecheck      # TypeScript check (frontend)
npm run lint           # Lint (frontend)
npm test               # Run legacy backend tests
```

---

## Compatibility Levels

| Level | Meaning |
|---|---|
| Platinum | Works perfectly, native support |
| Gold | Works well, minor issues possible |
| Silver | Works with known workarounds required |
| Bronze | Partially works, significant issues |
| Experimental | Untested or highly variable |
| Unsupported | Does not work |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Priority areas:
- Add compatibility reports for apps not in the registry
- Test on different hardware profiles and submit reports
- Alpha 2: Wine/Proton install automation
- Alpha 3: Agent workspace execution engine

---

## License

MIT — see [LICENSE](LICENSE).
