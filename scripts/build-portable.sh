#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_ROOT="$ROOT_DIR/build/portable"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
STAGE_DIR="$BUILD_ROOT/fusionos-$VERSION"
RELEASE_DIR="$BUILD_ROOT/releases"
APP_IMAGE="fusionos/app:$VERSION"
SKIP_IMAGES="${SKIP_IMAGES:-0}"
ENFORCE_OFFLINE="${ENFORCE_OFFLINE:-1}"
EXPECTED_IMAGES=(
  "fusionos-app.tar"
  "postgres-15-alpine.tar"
  "redis-7-alpine.tar"
  "nginx-1.27-alpine.tar"
)

log() {
  printf '[build-portable] %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    exit 1
  fi
}

require_docker_daemon() {
  if ! docker info >/dev/null 2>&1; then
    log "Docker daemon is not running. Start Docker and retry."
    exit 1
  fi
}

verify_offline_images() {
  local missing_count=0

  for image_name in "${EXPECTED_IMAGES[@]}"; do
    local image_path="$STAGE_DIR/images/$image_name"
    if [[ ! -s "$image_path" ]]; then
      log "Expected image not found or empty: $image_path"
      missing_count=$((missing_count + 1))
    fi
  done

  if [[ "$missing_count" -gt 0 ]]; then
    log "Offline artifact verification failed: missing $missing_count image tar file(s)."
    exit 1
  fi
}

log "Checking dependencies"
require_cmd node
require_cmd tar
require_cmd shasum

if [[ "$SKIP_IMAGES" == "1" && "$ENFORCE_OFFLINE" == "1" ]]; then
  log "SKIP_IMAGES=1 is incompatible with ENFORCE_OFFLINE=1."
  log "Unset SKIP_IMAGES or set ENFORCE_OFFLINE=0 for payload-only development builds."
  exit 1
fi

if [[ "$SKIP_IMAGES" != "1" ]]; then
  require_cmd docker
  require_docker_daemon
fi

log "Ensuring backend build output is available"
if [[ ! -f "$ROOT_DIR/backend/dist/backend/src/server.js" ]]; then
  log "backend build output not found. Run npm run build first."
  exit 1
fi

log "Preparing staging directory"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/payload" "$STAGE_DIR/images" "$STAGE_DIR/metadata" "$RELEASE_DIR"

if [[ "$SKIP_IMAGES" == "1" ]]; then
  log "SKIP_IMAGES=1 set: skipping Docker image build and save"
else
  log "Building offline app image $APP_IMAGE"
  docker build -f "$ROOT_DIR/backend/Dockerfile" -t "$APP_IMAGE" "$ROOT_DIR"

  log "Pulling dependency images"
  docker pull postgres:15-alpine
  docker pull redis:7-alpine
  docker pull nginx:1.27-alpine

  log "Saving images for offline use"
  docker save "$APP_IMAGE" -o "$STAGE_DIR/images/fusionos-app.tar"
  docker save postgres:15-alpine -o "$STAGE_DIR/images/postgres-15-alpine.tar"
  docker save redis:7-alpine -o "$STAGE_DIR/images/redis-7-alpine.tar"
  docker save nginx:1.27-alpine -o "$STAGE_DIR/images/nginx-1.27-alpine.tar"

  verify_offline_images
fi

log "Copying payload files"
cp "$ROOT_DIR/docker-compose.usb.yml" "$STAGE_DIR/payload/docker-compose.yml"
sed "s|^FUSIONOS_APP_IMAGE=.*$|FUSIONOS_APP_IMAGE=$APP_IMAGE|" "$ROOT_DIR/.env.usb.example" > "$STAGE_DIR/payload/.env.example"
cp "$ROOT_DIR/infra/nginx/default.conf" "$STAGE_DIR/payload/default.conf"
cp "$ROOT_DIR/scripts/install-portable.sh" "$STAGE_DIR/payload/install.sh"
cp "$ROOT_DIR/scripts/install-portable.ps1" "$STAGE_DIR/payload/install.ps1"
cp "$ROOT_DIR/docs/INSTALLATION.md" "$STAGE_DIR/payload/INSTALLATION.md"
cp "$ROOT_DIR/README.md" "$STAGE_DIR/payload/README.md"

cat > "$STAGE_DIR/metadata/manifest.json" <<EOF
{
  "name": "fusionos",
  "version": "$VERSION",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "appImage": "$APP_IMAGE",
  "enforceOffline": $([[ "$ENFORCE_OFFLINE" == "1" ]] && echo "true" || echo "false"),
  "offlineReady": $([[ "$SKIP_IMAGES" == "1" ]] && echo "false" || echo "true"),
  "skipImages": $([[ "$SKIP_IMAGES" == "1" ]] && echo "true" || echo "false"),
  "images": [
    "fusionos-app.tar",
    "postgres-15-alpine.tar",
    "redis-7-alpine.tar",
    "nginx-1.27-alpine.tar"
  ]
}
EOF

log "Generating checksums"
(
  cd "$STAGE_DIR"
  find . -type f ! -path './metadata/SHA256SUMS' | sort | while read -r file; do
    shasum -a 256 "$file"
  done > metadata/SHA256SUMS
)

ARCHIVE_PATH="$RELEASE_DIR/fusionos-$VERSION-usb.tar.gz"
log "Creating archive $ARCHIVE_PATH"
tar -C "$BUILD_ROOT" -czf "$ARCHIVE_PATH" "fusionos-$VERSION"

cat > "$RELEASE_DIR/USB-START-HERE.txt" <<EOF
FusionOS USB Install Package

File to copy:
- fusionos-$VERSION-usb.tar.gz

How to install on target machine:
1. Copy the archive to your USB drive.
2. Extract the archive on the target machine.
3. Open payload/INSTALLATION.md in the extracted folder.
4. Run payload/install.sh (Linux) or payload/install.ps1 (Windows).

If you need a payload-only development bundle, run:
ENFORCE_OFFLINE=0 SKIP_IMAGES=1 npm run build:portable
EOF

log "Done"
log "Archive: $ARCHIVE_PATH"
log "Stage dir: $STAGE_DIR"
