use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use std::sync::Arc;
use serde_json::json;

use crate::handlers::health::AppState;
use crate::models::runtime::ResolveRuntimePayload;

pub async fn resolve_runtime(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ResolveRuntimePayload>,
) -> impl IntoResponse {
    match state.repo.resolve_runtime(&payload) {
        Some(resolution) => (StatusCode::OK, Json(resolution)).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "App not found in compatibility registry" })),
        )
            .into_response(),
    }
}
