# TriPKG Registry API

## Authentication

Current Alpha endpoints are public, with rate limits and input validation enabled. Device-token enforcement will be added with auth endpoints in the next phase.

## Endpoints

### GET /health

- Description: Liveness/readiness endpoint with Postgres and Redis dependency checks.
- Responses:
  - `200`: healthy or configured-without-failures
  - `503`: at least one configured dependency is down

### GET /metrics

- Description: Prometheus metrics endpoint.
- Responses:
  - `200`: text/plain metrics payload

### GET /api/v1/packages/search

- Description: Search packages across ecosystems.
- Query:
  - `q` (required, string)
  - `ecosystem` (optional: linux|windows|macos)
  - `page` (optional, default 1)
  - `pageSize` (optional, default 20, max 50)
- Responses:
  - `200`: `{ results, total, page }`
  - `400`: schema validation failure

### GET /api/v1/packages/:id

- Description: Retrieve package metadata.
- Responses:
  - `200`: package record
  - `404`: package not found

### GET /api/v1/packages/:id/compat

- Description: List compatibility reports for package.
- Responses:
  - `200`: `{ reports: [] }`

### POST /api/v1/compat/submit

- Description: Submit compatibility result.
- Body:
```json
{
  "pkgId": "pkg_adobe_photoshop_win32",
  "hwProfile": "nvidia-rtx-4080",
  "triosVersion": "0.1.0",
  "result": "works_perfectly",
  "notes": "Runs correctly"
}
```
- Responses:
  - `201`: `{ "id": "compat_1", "accepted": true }`
  - `400`: schema validation failure
  - `429`: rate limit exceeded

### POST /api/v1/telemetry

- Description: Submit opt-in telemetry event.
- Body:
```json
{
  "event": "app_launched",
  "pkgId": "pkg_adobe_photoshop_win32",
  "sessionId": "93fbbffd-7728-4ef8-b9b9-6615048f77c5",
  "osVersion": "0.1.0",
  "hwProfile": "intel-i7-13700h",
  "timestamp": "2026-04-15T09:30:00.000Z"
}
```
- Responses:
  - `202`: `{ "accepted": true }`
  - `400`: schema validation failure
  - `429`: rate limit exceeded
