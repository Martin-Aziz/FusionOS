# FusionOS API Reference

## Overview

All API endpoints are served by the Rust (Axum) backend on port 4000.
Requests and responses use JSON. All write endpoints are rate-limited to 5 req/min per IP.
Global read limit: 100 req/min.

Every response includes an `X-Request-ID` header for request tracing.

---

## Health

### `GET /health`

Returns the service health status.

**Response 200:**
```json
{
  "status": "ok",
  "checks": {
    "postgres": "not_configured",
    "redis": "not_configured"
  },
  "timestamp": "2026-06-01T00:00:00Z"
}
```

`status` is `"degraded"` (HTTP 503) if a configured dependency is unreachable.

---

## Metrics

### `GET /metrics`

Returns Prometheus metrics in text/plain format.

Includes `fusionos_http_request_duration_seconds` histogram with `method`, `route`, `status_code` labels.

---

## Apps

### `GET /api/v1/apps/search`

Search or browse the compatibility registry.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | No | Name/description search (max 120 chars) |
| `category` | string | No | Filter by category (games, development, creative, productivity) |
| `compatibility_level` | string | No | Filter by level (platinum, gold, silver, bronze, experimental, unsupported, unknown) |
| `runtime_route` | string | No | Filter by route (native-linux, wine, proton, etc.) |
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Results per page 1–50 (default: 20) |

**Response 200:**
```json
{
  "results": [ { "id": "...", "name": "Steam", "slug": "steam", ... } ],
  "total": 10,
  "page": 1
}
```

---

### `GET /api/v1/apps/:slug`

Get full app compatibility record.

**Response 200:** Full `AppCompatibilityRecord`

**Response 404:**
```json
{ "error": "App not found" }
```

---

### `GET /api/v1/apps/:slug/compatibility`

Get all community compatibility reports for an app.

**Response 200:**
```json
{
  "reports": [
    {
      "id": "report_1",
      "appSlug": "steam",
      "runtimeRoute": "native-linux",
      "worked": true,
      "systemProfile": { "arch": "x86_64", "ramGb": 16, "fusionOsVersion": "0.1.0" },
      "notes": "Worked perfectly on AMD hardware.",
      "createdAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /api/v1/apps/:slug/reports`

Submit a compatibility report. Rate limited: 5 req/min.

**Request body:**
```json
{
  "runtimeRoute": "native-linux",
  "worked": true,
  "systemProfile": {
    "arch": "x86_64",
    "gpu": "AMD RX 6600",
    "ramGb": 8,
    "fusionOsVersion": "0.1.0"
  },
  "notes": "Installed from apt, worked without issues."
}
```

**Response 201:**
```json
{ "id": "report_1", "accepted": true }
```

**Response 404:** App not found

**Response 422:** Validation error

---

## Runtime Router

### `POST /api/v1/runtime/resolve`

Resolve the recommended runtime route for an app given a system profile.

**Request body:**
```json
{
  "appSlug": "photoshop",
  "systemProfile": {
    "arch": "x86_64",
    "gpu": "NVIDIA RTX 3060",
    "ramGb": 16,
    "fusionOsVersion": "0.1.0"
  }
}
```

**Response 200:**
```json
{
  "appSlug": "photoshop",
  "recommendedRoute": "wine",
  "alternativeRoutes": ["vm"],
  "rationale": "Wine compatibility layer — runs Windows binaries without a full VM.",
  "riskLevel": "medium",
  "knownIssues": [ { "id": "ps-1", "title": "GPU acceleration not supported", "severity": "major", ... } ]
}
```

**Response 404:** App not found in registry

---

## Agent Workspaces

Alpha API. Execution engine planned for Alpha 3.

### `GET /api/v1/workspaces`

**Response 200:**
```json
{ "workspaces": [ { "id": "...", "name": "...", "status": "idle", ... } ] }
```

### `POST /api/v1/workspaces`

**Request body:**
```json
{
  "name": "my-agent",
  "allowedPaths": ["/home/user/projects"],
  "networkAccess": "limited",
  "allowedApps": [],
  "runtimeRoutes": ["native-linux", "container"]
}
```

**Response 201:** Full `AgentWorkspace` object.

### `GET /api/v1/workspaces/:id`

**Response 200:** Full `AgentWorkspace` object.
**Response 404:** Workspace not found.

### `POST /api/v1/workspaces/:id/run`

Sets workspace status to `running`. Execution stub — no real process spawning in Alpha.

**Response 200:** Updated workspace object.

### `GET /api/v1/workspaces/:id/logs`

**Response 200:**
```json
{ "logs": [], "note": "Log streaming not yet implemented. Planned for Alpha 3." }
```

---

## Telemetry

### `POST /api/v1/telemetry`

Opt-in telemetry. Rate limited: 5 req/min.

**Request body:**
```json
{
  "event": "app_installed",
  "appSlug": "steam",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "fusionOsVersion": "0.1.0",
  "arch": "x86_64",
  "ramGb": 8,
  "timestamp": "2026-06-01T00:00:00Z"
}
```

**Event types:** `os_boot`, `app_installed`, `app_launched`, `app_crashed`, `compat_report_submitted`, `workspace_created`, `workspace_started`, `runtime_resolved`

**Response 202:**
```json
{ "accepted": true }
```

---

## Error Format

All errors use consistent JSON:

```json
{
  "error": "Human-readable description"
}
```

Validation errors from the Rust backend return HTTP 422 with a structured body.
