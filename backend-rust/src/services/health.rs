use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct HealthStatus {
    pub status: &'static str,
    pub checks: HealthChecks,
    pub timestamp: String,
}

#[derive(Debug, Serialize)]
pub struct HealthChecks {
    pub postgres: &'static str,
    pub redis: &'static str,
}

pub fn get_health_status(database_url: Option<&str>, redis_url: Option<&str>) -> HealthStatus {
    let postgres = if database_url.is_some() { "not_connected" } else { "not_configured" };
    let redis = if redis_url.is_some() { "not_connected" } else { "not_configured" };

    HealthStatus {
        status: "ok",
        checks: HealthChecks { postgres, redis },
        timestamp: chrono::Utc::now().to_rfc3339(),
    }
}
