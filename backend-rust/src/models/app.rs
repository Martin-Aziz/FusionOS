use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum RuntimeRoute {
    NativeLinux,
    Flatpak,
    Appimage,
    Apt,
    Wine,
    Proton,
    Container,
    Vm,
    AgentWorkspace,
    MacosExperimental,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum CompatibilityLevel {
    Platinum,
    Gold,
    Silver,
    Bronze,
    Experimental,
    Unsupported,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnownIssue {
    pub id: String,
    pub title: String,
    pub severity: IssueSeverity,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workaround: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IssueSeverity {
    Blocking,
    Major,
    Minor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareNote {
    pub component: HardwareComponent,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HardwareComponent {
    Gpu,
    Cpu,
    Ram,
    Storage,
    Network,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameSupport {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub engine: Option<String>,
    pub anticheat_risk: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anticheat_notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub proton_db_rating: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub controller_support: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub launchers: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallAction {
    pub method: RuntimeRoute,
    pub command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppCompatibilityRecord {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub category: String,
    pub description: String,
    pub recommended_route: RuntimeRoute,
    pub alternative_routes: Vec<RuntimeRoute>,
    pub compatibility_level: CompatibilityLevel,
    pub known_issues: Vec<KnownIssue>,
    pub hardware_notes: Vec<HardwareNote>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub game_support: Option<GameSupport>,
    pub last_verified_at: String,
    pub report_count: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub install_action: Option<InstallAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSearchResult {
    pub results: Vec<AppCompatibilityRecord>,
    pub total: usize,
    pub page: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSearchQuery {
    pub q: Option<String>,
    pub category: Option<String>,
    pub compatibility_level: Option<CompatibilityLevel>,
    pub runtime_route: Option<RuntimeRoute>,
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_page_size")]
    pub page_size: u32,
}

fn default_page() -> u32 { 1 }
fn default_page_size() -> u32 { 20 }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemProfile {
    pub arch: Arch,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gpu: Option<String>,
    pub ram_gb: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kernel_version: Option<String>,
    pub fusion_os_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Arch {
    X86_64,
    Arm64,
}
