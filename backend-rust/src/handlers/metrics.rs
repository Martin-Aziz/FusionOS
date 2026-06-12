use axum::{extract::State, http::StatusCode, response::Response};
use std::sync::Arc;
use crate::handlers::health::AppState;

pub async fn metrics_handler(State(state): State<Arc<AppState>>) -> Response {
    use prometheus::Encoder;
    let encoder = prometheus::TextEncoder::new();
    let mut buffer = Vec::new();
    if encoder.encode(&state.metrics_registry.gather(), &mut buffer).is_err() {
        return (StatusCode::INTERNAL_SERVER_ERROR, "metrics encode error").into_response();
    }
    let body = String::from_utf8(buffer).unwrap_or_default();
    (
        StatusCode::OK,
        [(axum::http::header::CONTENT_TYPE, "text/plain; version=0.0.4; charset=utf-8")],
        body,
    )
        .into_response()
}

use axum::response::IntoResponse;
