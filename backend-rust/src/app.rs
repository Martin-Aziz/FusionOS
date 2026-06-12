use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    request_id::{PropagateRequestIdLayer, SetRequestIdLayer},
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use axum::http::Method;

use crate::config::Config;
use crate::handlers::health::{health_handler, AppState};
use crate::handlers::metrics::metrics_handler;
use crate::handlers::apps::{get_app, get_app_compatibility, search_apps, submit_report};
use crate::handlers::runtime::resolve_runtime;
use crate::handlers::workspaces::{
    create_workspace, get_workspace, get_workspace_logs, list_workspaces, run_workspace,
};
use crate::handlers::telemetry::record_telemetry;
use crate::middleware::metrics_layer::create_metrics;
use crate::middleware::request_id::MakeUuidRequestId;
use crate::repositories::InMemoryRepository;

pub fn build_app(config: Config) -> Router {
    let metrics_registry = prometheus::Registry::new();
    prometheus::default_registry()
        .gather()
        .iter()
        .for_each(|_| {});

    // Register default process metrics
    let _ = prometheus::register_counter_vec!(
        prometheus::opts!("fusionos_requests_total", "Total HTTP requests"),
        &["method", "route", "status"]
    );

    let request_duration = create_metrics(&metrics_registry);

    let state = Arc::new(AppState {
        repo: InMemoryRepository::new(),
        config: config.clone(),
        metrics_registry,
        request_duration,
    });

    let cors = if config.is_development() {
        CorsLayer::new()
            .allow_origin("http://localhost:5173".parse::<axum::http::HeaderValue>().unwrap())
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers(Any)
    } else {
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers(Any)
    };

    let api_routes = Router::new()
        .route("/apps/search", get(search_apps))
        .route("/apps/:slug", get(get_app))
        .route("/apps/:slug/compatibility", get(get_app_compatibility))
        .route("/apps/:slug/reports", post(submit_report))
        .route("/runtime/resolve", post(resolve_runtime))
        .route("/workspaces", get(list_workspaces).post(create_workspace))
        .route("/workspaces/:id", get(get_workspace))
        .route("/workspaces/:id/run", post(run_workspace))
        .route("/workspaces/:id/logs", get(get_workspace_logs))
        .route("/telemetry", post(record_telemetry));

    let mut router = Router::new()
        .route("/health", get(health_handler))
        .route("/metrics", get(metrics_handler))
        .nest("/api/v1", api_routes)
        .with_state(state);

    // Serve frontend static files in production
    if !config.is_development() {
        let dist = config.frontend_dist_path.clone();
        let serve_dir = ServeDir::new(&dist)
            .not_found_service(ServeFile::new(format!("{}/index.html", dist)));
        router = router.fallback_service(serve_dir);
    }

    router.layer(
        ServiceBuilder::new()
            .layer(SetRequestIdLayer::x_request_id(MakeUuidRequestId))
            .layer(PropagateRequestIdLayer::x_request_id())
            .layer(TraceLayer::new_for_http())
            .layer(cors),
    )
}
