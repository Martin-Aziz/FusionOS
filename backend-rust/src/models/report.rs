use serde::{Deserialize, Serialize};
use crate::models::app::{RuntimeRoute, SystemProfile};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompatibilityReport {
    pub id: String,
    pub app_slug: String,
    pub runtime_route: RuntimeRoute,
    pub worked: bool,
    pub system_profile: SystemProfile,
    pub notes: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitReportPayload {
    pub runtime_route: RuntimeRoute,
    pub worked: bool,
    pub system_profile: SystemProfile,
    pub notes: String,
}
