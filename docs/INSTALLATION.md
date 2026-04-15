# FusionOS Offline USB Installation

This guide installs the current FusionOS Alpha backend stack on Windows or Linux from a USB artifact, without downloading container images during install.

## 1. Build USB Artifact

From project root:

### macOS/Linux

1. Run `npm install`
2. Run `npm run build:portable`
3. Copy `build/portable/releases/fusionos-<version>-usb.tar.gz` to your USB drive.

Notes:

- `npm run build:portable` is strict offline mode and requires Docker daemon running so image tar files are bundled.
- For payload-only development bundles (not offline-installable), run `npm run build:portable:payload`.

### Windows PowerShell

1. Run `npm install`
2. Run `npm run build:portable:win`
3. Copy `build/portable/releases/fusionos-<version>-usb.zip` to your USB drive.

## 2. Prepare Target Machine

Requirements:

- Docker Engine or Docker Desktop installed and running
- Docker Compose v2 available through `docker compose`
- At least 4 GB free disk space
- Open ports: 4000, 5432, 6379, 8080

## 3. Install from USB

Extract the archive on target machine.

### Linux

1. Open terminal in extracted folder.
2. Run `chmod +x payload/install.sh`
3. Run `./payload/install.sh` or `./payload/install.sh /opt/fusionos`

### Windows

1. Open PowerShell in extracted folder.
2. Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`
3. Run `./payload/install.ps1` or `./payload/install.ps1 -InstallDir D:\FusionOS`

Installer actions:

1. Verifies Docker daemon, Docker Compose v2, writable install directory, free disk space, and host ports.
2. Copies payload to install directory.
3. Creates `.env` from `.env.example` if missing and generates `DEVICE_TOKEN_SALT` if weak or placeholder.
4. Verifies package checksums from `metadata/SHA256SUMS` when available.
5. Loads offline Docker images from `images/*.tar`.
6. Starts stack with `docker compose up -d`.
7. Waits for app health status; on timeout, rolls back started services.

## 4. Verify Installation

1. Run `docker compose -f <install-dir>/docker-compose.yml --env-file <install-dir>/.env ps`
2. Open `http://localhost:4000/health`
3. Optional: open `http://localhost:8080/health` through reverse proxy

## 5. Stop or Uninstall

Stop:

- `docker compose -f <install-dir>/docker-compose.yml --env-file <install-dir>/.env down`

Uninstall:

1. Stop stack as above.
2. Remove install directory.
3. Optional: remove images using `docker image rm fusionos/app:<version> postgres:15-alpine redis:7-alpine nginx:1.27-alpine`

## 6. Troubleshooting

- Docker not running: start Docker service/Desktop and retry.
- Docker Compose missing: install Docker Compose v2 (`docker compose version` must work).
- Missing image tar files: rebuild with Docker running using `npm run build:portable`.
- Port conflicts: edit `<install-dir>/.env` for `PORT`, `POSTGRES_PORT`, `REDIS_PORT`, `PROXY_PORT` and restart stack.
- Database URL mismatch: keep `DATABASE_URL` host as `postgres` for container network installs.
- Health check timeout: inspect logs with `docker compose -f <install-dir>/docker-compose.yml --env-file <install-dir>/.env logs`.
