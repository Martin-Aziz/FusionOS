use serde::{Deserialize, Serialize};
use crate::models::app::RuntimeRoute;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentWorkspace {
    pub id: String,
    pub name: String,
    pub status: WorkspaceStatus,
    pub allowed_paths: Vec<String>,
    pub network_access: NetworkAccess,
    pub allowed_apps: Vec<String>,
    pub runtime_routes: Vec<RuntimeRoute>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkspaceStatus {
    Idle,
    Running,
    Failed,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NetworkAccess {
    None,
    Limited,
    Full,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceCreatePayload {
    pub name: String,
    pub allowed_paths: Vec<String>,
    pub network_access: NetworkAccess,
    pub allowed_apps: Vec<String>,
    pub runtime_routes: Vec<RuntimeRoute>,
}
