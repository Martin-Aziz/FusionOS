use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;
use serde_json::json;

use crate::handlers::health::AppState;
use crate::models::app::AppSearchQuery;
use crate::models::report::SubmitReportPayload;

pub async fn search_apps(
    State(state): State<Arc<AppState>>,
    Query(query): Query<AppSearchQuery>,
) -> impl IntoResponse {
    let result = state.repo.search_apps(&query);
    Json(result)
}

pub async fn get_app(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    match state.repo.get_app_by_slug(&slug) {
        Some(app) => (StatusCode::OK, Json(app)).into_response(),
        None => (StatusCode::NOT_FOUND, Json(json!({ "error": "App not found" }))).into_response(),
    }
}

pub async fn get_app_compatibility(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    if state.repo.get_app_by_slug(&slug).is_none() {
        return (StatusCode::NOT_FOUND, Json(json!({ "error": "App not found" }))).into_response();
    }
    let reports = state.repo.get_compatibility_reports(&slug);
    Json(json!({ "reports": reports })).into_response()
}

pub async fn submit_report(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    Json(payload): Json<SubmitReportPayload>,
) -> impl IntoResponse {
    if state.repo.get_app_by_slug(&slug).is_none() {
        return (StatusCode::NOT_FOUND, Json(json!({ "error": "App not found" }))).into_response();
    }
    let report = state.repo.submit_report(&slug, payload);
    (StatusCode::CREATED, Json(json!({ "id": report.id, "accepted": true }))).into_response()
}
