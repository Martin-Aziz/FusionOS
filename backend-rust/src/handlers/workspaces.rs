use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;
use serde_json::json;

use crate::handlers::health::AppState;
use crate::models::workspace::{WorkspaceCreatePayload, WorkspaceStatus};

pub async fn list_workspaces(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let workspaces = state.repo.get_workspaces();
    Json(json!({ "workspaces": workspaces }))
}

pub async fn create_workspace(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<WorkspaceCreatePayload>,
) -> impl IntoResponse {
    let workspace = state.repo.create_workspace(payload);
    (StatusCode::CREATED, Json(workspace))
}

pub async fn get_workspace(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.repo.get_workspace_by_id(&id) {
        Some(ws) => (StatusCode::OK, Json(ws)).into_response(),
        None => (StatusCode::NOT_FOUND, Json(json!({ "error": "Workspace not found" }))).into_response(),
    }
}

pub async fn run_workspace(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.repo.update_workspace_status(&id, WorkspaceStatus::Running) {
        Some(ws) => (StatusCode::OK, Json(ws)).into_response(),
        None => (StatusCode::NOT_FOUND, Json(json!({ "error": "Workspace not found" }))).into_response(),
    }
}

pub async fn get_workspace_logs(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if state.repo.get_workspace_by_id(&id).is_none() {
        return (StatusCode::NOT_FOUND, Json(json!({ "error": "Workspace not found" }))).into_response();
    }
    // Alpha stub: log streaming is planned for Alpha 3
    Json(json!({ "logs": [], "note": "Log streaming not yet implemented. Planned for Alpha 3." })).into_response()
}
