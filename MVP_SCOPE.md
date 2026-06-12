# FusionOS MVP Scope (Alpha 1)

## What This Alpha Delivers

1. **Compatibility Registry API** — search, browse, and retrieve app records with runtime routes, compatibility levels, known issues, and hardware notes.

2. **Community Report Submission** — users submit what worked, on what hardware, through which runtime route.

3. **Runtime Router** — resolves the recommended execution path for any app in the registry based on a system profile.

4. **Agent Workspace API** — create, list, and view workspaces. Execution stub in Alpha 1; real engine in Alpha 3.

5. **Web Interface** — React SPA with homepage, compatibility registry browser, app detail pages, runtime router explainer, and workspace management.

6. **Rust Backend** — Axum + Tokio API server with request tracing, Prometheus metrics, structured JSON logging, and in-memory storage.

7. **Seed Data** — 10 apps with honest, conservative compatibility ratings:
   Steam (platinum), VS Code (platinum), Python (platinum), Blender (gold), Docker (gold), OBS Studio (gold), Cursor (gold), Photoshop (silver), Excel (silver), League of Legends (bronze).

## Not Included in Alpha 1

- Full macOS app compatibility. `macos-experimental` route exists as a placeholder. Not a supported path.
- Automated Wine/Proton install orchestration. Guidance only.
- Real agent workspace execution engine.
- Persistent database (PostgreSQL). In-memory only; data resets on restart.
- Authentication / user accounts.
- Custom microkernel or low-level OS components.
- ARM/RISC-V builds.
- GUI OS installer.

## Alpha 1 Success Criteria

1. `cargo run` in `backend-rust/` starts the server. `GET /health` returns 200.
2. `npm run dev:frontend` serves the web UI at localhost:5173.
3. App search, detail, compatibility reports, and report submission all work end-to-end.
4. Runtime resolver returns a route with rationale for all 10 seed apps.
5. Workspace create/list/get works. Run and logs return stubs.
6. `npm run typecheck`, `npm run lint`, and `npm run build` pass.
7. `cargo test` passes (9+ tests).
