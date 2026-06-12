use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use std::sync::Arc;
use crate::repositories::InMemoryRepository;
use crate::services::health::get_health_status;
use crate::config::Config;

pub async fn health_handler(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let status = get_health_status(
        state.config.database_url.as_deref(),
        state.config.redis_url.as_deref(),
    );
    let http_status = if status.status == "degraded" {
        StatusCode::SERVICE_UNAVAILABLE
    } else {
        StatusCode::OK
    };
    (http_status, Json(status))
}

pub struct AppState {
    pub repo: InMemoryRepository,
    pub config: Config,
    pub metrics_registry: prometheus::Registry,
    #[allow(dead_code)]
    pub request_duration: prometheus::HistogramVec,
}
