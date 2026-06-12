use serde::{Deserialize, Serialize};
use crate::models::app::{RuntimeRoute, KnownIssue, SystemProfile};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeResolution {
    pub app_slug: String,
    pub recommended_route: RuntimeRoute,
    pub alternative_routes: Vec<RuntimeRoute>,
    pub rationale: String,
    pub risk_level: RiskLevel,
    pub known_issues: Vec<KnownIssue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolveRuntimePayload {
    pub app_slug: String,
    #[allow(dead_code)]
    pub system_profile: SystemProfile,
}
