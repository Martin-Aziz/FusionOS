use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryEvent {
    pub event: TelemetryEventType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub app_slug: Option<String>,
    pub session_id: String,
    pub fusion_os_version: String,
    pub arch: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gpu: Option<String>,
    pub ram_gb: f64,
    pub timestamp: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TelemetryEventType {
    OsBoot,
    AppInstalled,
    AppLaunched,
    AppCrashed,
    CompatReportSubmitted,
    WorkspaceCreated,
    WorkspaceStarted,
    RuntimeResolved,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryEventPayload {
    pub event: TelemetryEventType,
    pub app_slug: Option<String>,
    pub session_id: String,
    pub fusion_os_version: String,
    pub arch: String,
    pub gpu: Option<String>,
    pub ram_gb: f64,
    pub timestamp: String,
    pub metadata: Option<serde_json::Value>,
}
