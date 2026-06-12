use std::env;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct Config {
    pub node_env: String,
    pub port: u16,
    pub log_level: String,
    pub database_url: Option<String>,
    pub redis_url: Option<String>,
    pub rate_limit_max: u32,
    pub rate_limit_window_secs: u64,
    pub device_token_salt: Option<String>,
    pub frontend_dist_path: String,
}

impl Config {
    pub fn from_env() -> Self {
        let node_env = env::var("NODE_ENV").unwrap_or_else(|_| "development".to_string());
        let port: u16 = env::var("PORT")
            .unwrap_or_else(|_| "4000".to_string())
            .parse()
            .unwrap_or(4000);
        let log_level = env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());
        let database_url = env::var("DATABASE_URL").ok();
        let redis_url = env::var("REDIS_URL").ok();
        let rate_limit_max: u32 = env::var("RATE_LIMIT_MAX")
            .unwrap_or_else(|_| "100".to_string())
            .parse()
            .unwrap_or(100);
        let rate_limit_window_secs: u64 = env::var("RATE_LIMIT_WINDOW_MS")
            .unwrap_or_else(|_| "60000".to_string())
            .parse::<u64>()
            .unwrap_or(60000)
            / 1000;
        let device_token_salt = env::var("DEVICE_TOKEN_SALT").ok();
        let frontend_dist_path = env::var("FRONTEND_DIST_PATH")
            .unwrap_or_else(|_| "frontend/dist".to_string());

        Self {
            node_env,
            port,
            log_level,
            database_url,
            redis_url,
            rate_limit_max,
            rate_limit_window_secs,
            device_token_salt,
            frontend_dist_path,
        }
    }

    pub fn is_development(&self) -> bool {
        self.node_env == "development"
    }
}
