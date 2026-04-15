# FusionOS

Run anything. Anywhere. Together.

FusionOS is an open-source universal operating system initiative focused on unifying Linux-native workflows with compatibility-first Windows support and a future macOS path.

## Why FusionOS

Modern teams still split development across multiple operating systems. FusionOS aims to provide one host runtime and one package intelligence layer so software can be installed, executed, and managed across ecosystems without dual-boot friction or VM-heavy workflows.

## Project Status

FusionOS is currently in Alpha. The repository provides a contract-first backend vertical slice, architecture documentation, and foundations for expanding runtime and desktop capabilities.

## Core Pillars

- Host Runtime: Linux-based foundation for Alpha
- Compatibility Services: WinEnv and Linux routes first
- Package Intelligence: Registry contracts and compatibility reporting
- Desktop Experience: Shell integration contracts
- Build and Release: CI, containers, and quality gates

Reference architecture diagram: `trios_os_architecture.svg`.

## Repository Layout

```text
backend/        Express + TypeScript API and tests
common/         Shared schemas, types, and constants
frontend/       Frontend application source
docs/           Architecture and ADR documentation
infra/          Infrastructure configuration (nginx, etc.)
scripts/        Local automation scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker 24+
- Docker Compose

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

### Full Local Stack (Docker)

```bash
docker-compose up --build
```

### Common Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## API Quick Check

- `GET /health`
- `GET /metrics`
- `GET /api/v1/packages/search?q=photoshop&page=1&pageSize=10`

For API contract details, see `API.md`.

## Testing

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Security

- Request validation via Zod
- Helmet security headers
- Rate limiting for global and sensitive endpoints
- Correlation IDs and structured JSON logging
- Generic internal error responses

If you discover a security issue, open a private report with maintainers before filing a public issue.

## Documentation

- Architecture overview: `docs/ARCHITECTURE.md`
- Delivery roadmap: `docs/ROADMAP.md`
- MVP scope: `MVP_SCOPE.md`
- Architecture decisions:
  - `docs/adr/ADR-001-kernel-base.md`
  - `docs/adr/ADR-002-winenv-strategy.md`
  - `docs/adr/ADR-003-telemetry-policy.md`

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before opening pull requests.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
