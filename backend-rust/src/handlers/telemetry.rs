use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use std::sync::Arc;
use serde_json::json;

use crate::handlers::health::AppState;
use crate::models::telemetry::TelemetryEventPayload;

pub async fn record_telemetry(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<TelemetryEventPayload>,
) -> impl IntoResponse {
    state.repo.record_telemetry(payload);
    (StatusCode::ACCEPTED, Json(json!({ "accepted": true })))
}
