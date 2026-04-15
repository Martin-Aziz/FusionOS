#!/usr/bin/env bash
set -euo pipefail

PACKAGE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAYLOAD_DIR="$PACKAGE_ROOT/payload"
IMAGES_DIR="$PACKAGE_ROOT/images"
INSTALL_DIR="${1:-$HOME/fusionos}"
ALLOW_ONLINE_PULL="${ALLOW_ONLINE_PULL:-0}"
MIN_DISK_MB="${MIN_DISK_MB:-4096}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-90}"
HEALTH_INTERVAL_SECONDS="${HEALTH_INTERVAL_SECONDS:-3}"
EXPECTED_IMAGES=(
  "fusionos-app.tar"
  "postgres-15-alpine.tar"
  "redis-7-alpine.tar"
  "nginx-1.27-alpine.tar"
)

log() {
  printf '[install-portable] %s\n' "$1"
}

fail() {
  log "$1"
  exit 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

run_compose() {
  (
    cd "$INSTALL_DIR"
    docker compose -f docker-compose.yml --env-file .env "$@"
  )
}

check_docker_compose() {
  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose v2 is required (docker compose ...)."
  fi
}

ensure_install_dir_writable() {
  mkdir -p "$INSTALL_DIR"
  local probe_file="$INSTALL_DIR/.fusionos_write_probe"
  if ! : > "$probe_file" 2>/dev/null; then
    fail "Install directory is not writable: $INSTALL_DIR"
  fi
  rm -f "$probe_file"
}

check_disk_space() {
  local available_mb
  available_mb="$(df -Pm "$INSTALL_DIR" | awk 'NR==2 {print $4}')"
  if [[ -z "$available_mb" || "$available_mb" -lt "$MIN_DISK_MB" ]]; then
    fail "Insufficient free disk space at $INSTALL_DIR. Need at least ${MIN_DISK_MB}MB free."
  fi
}

read_env_value() {
  local key="$1"
  local default_value="$2"
  local value
  value="$(grep -E "^${key}=" "$INSTALL_DIR/.env" | tail -n1 | cut -d'=' -f2- || true)"
  value="${value%\"}"
  value="${value#\"}"

  if [[ -z "$value" ]]; then
    echo "$default_value"
  else
    echo "$value"
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"
  local env_file="$INSTALL_DIR/.env"

  if grep -qE "^${key}=" "$env_file"; then
    sed -i.bak "s|^${key}=.*$|${key}=${value}|" "$env_file"
    rm -f "$env_file.bak"
  else
    printf '%s=%s\n' "$key" "$value" >> "$env_file"
  fi
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi

  head -c 64 /dev/urandom | base64 | tr -d '=+/' | cut -c1-64
}

ensure_device_token_salt() {
  local token_salt
  token_salt="$(read_env_value "DEVICE_TOKEN_SALT" "")"

  if [[ -z "$token_salt" || "$token_salt" == *"replace-with"* || "${#token_salt}" -lt 32 ]]; then
    token_salt="$(generate_secret)"
    set_env_value "DEVICE_TOKEN_SALT" "$token_salt"
    log "Generated a secure DEVICE_TOKEN_SALT in .env"
  fi
}

port_in_use() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${port}$"
    return $?
  fi

  if command -v netstat >/dev/null 2>&1; then
    netstat -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${port}$"
    return $?
  fi

  return 2
}

check_port_available() {
  local port="$1"
  local label="$2"

  if port_in_use "$port"; then
    fail "$label port $port is already in use. Update .env or free the port."
  fi

  local status=$?
  if [[ "$status" -eq 2 ]]; then
    log "Warning: unable to verify whether port $port is free (lsof/ss/netstat not found)."
  fi
}

verify_checksums() {
  local checksum_file="$PACKAGE_ROOT/metadata/SHA256SUMS"

  if [[ ! -f "$checksum_file" ]]; then
    log "Warning: checksum file not found at metadata/SHA256SUMS; skipping integrity verification."
    return
  fi

  if command -v shasum >/dev/null 2>&1; then
    (cd "$PACKAGE_ROOT" && shasum -a 256 -c metadata/SHA256SUMS >/dev/null)
    return
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    (cd "$PACKAGE_ROOT" && sha256sum -c metadata/SHA256SUMS >/dev/null)
    return
  fi

  log "Warning: neither shasum nor sha256sum found; skipping integrity verification."
}

rollback_stack() {
  log "Rolling back stack startup"
  run_compose down >/dev/null 2>&1 || true
}

wait_for_health() {
  local timeout_at=$((SECONDS + HEALTH_TIMEOUT_SECONDS))

  while [[ "$SECONDS" -lt "$timeout_at" ]]; do
    local container_id
    container_id="$(run_compose ps -q app 2>/dev/null | tr -d '\r' || true)"

    if [[ -n "$container_id" ]]; then
      local health_status
      health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)"
      if [[ "$health_status" == "healthy" ]]; then
        return 0
      fi
    fi

    sleep "$HEALTH_INTERVAL_SECONDS"
  done

  return 1
}

log "Checking dependencies"
require_cmd docker

if ! docker info >/dev/null 2>&1; then
  fail "Docker daemon is not running. Start Docker and retry."
fi

check_docker_compose

if [[ ! -d "$PAYLOAD_DIR" || ! -d "$IMAGES_DIR" ]]; then
  fail "Invalid package layout. Expected payload/ and images/ alongside this script."
fi

log "Installing to $INSTALL_DIR"
ensure_install_dir_writable
cp -R "$PAYLOAD_DIR"/. "$INSTALL_DIR/"

if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
fi

ensure_device_token_salt
check_disk_space

APP_PORT="$(read_env_value "PORT" "4000")"
POSTGRES_PORT="$(read_env_value "POSTGRES_PORT" "5432")"
REDIS_PORT="$(read_env_value "REDIS_PORT" "6379")"
PROXY_PORT="$(read_env_value "PROXY_PORT" "8080")"

check_port_available "$APP_PORT" "App"
check_port_available "$POSTGRES_PORT" "Postgres"
check_port_available "$REDIS_PORT" "Redis"
check_port_available "$PROXY_PORT" "Reverse proxy"

verify_checksums

image_files=()
missing_images=()

for image_name in "${EXPECTED_IMAGES[@]}"; do
  image_path="$IMAGES_DIR/$image_name"
  if [[ -s "$image_path" ]]; then
    image_files+=("$image_path")
  else
    missing_images+=("$image_name")
  fi
done

if [[ "${#missing_images[@]}" -gt 0 ]]; then
  if [[ "$ALLOW_ONLINE_PULL" == "1" ]]; then
    log "Missing offline image files: ${missing_images[*]}. Continuing with online pull enabled."
  else
    fail "Missing offline image files: ${missing_images[*]}. Rebuild package with Docker running or set ALLOW_ONLINE_PULL=1."
  fi
fi

if [[ "${#image_files[@]}" -gt 0 ]]; then
  log "Loading offline images"
  for image in "${image_files[@]}"; do
    log "Loading $(basename "$image")"
    docker load -i "$image" >/dev/null
  done
fi

log "Starting services"
run_compose up -d

log "Waiting for app health status"
if ! wait_for_health; then
  rollback_stack
  fail "Timed out waiting for app health check. Stack was rolled back."
fi

log "Install complete"
log "Health check URL: http://localhost:${APP_PORT}/health"
log "Manage stack from $INSTALL_DIR with: docker compose ps"
