use dotenvy::dotenv;
use std::net::SocketAddr;
use tracing::info;

mod app;
mod config;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod services;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let cfg = config::Config::from_env();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| cfg.log_level.parse().unwrap_or_default()),
        )
        .json()
        .init();

    let router = app::build_app(cfg.clone());

    let addr: SocketAddr = format!("0.0.0.0:{}", cfg.port).parse().unwrap();
    info!(port = cfg.port, env = %cfg.node_env, "FusionOS backend server started");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, router).await.unwrap();
}
