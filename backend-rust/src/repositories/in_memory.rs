use std::collections::HashMap;
use std::time::{Duration, Instant};
use parking_lot::Mutex;
use uuid::Uuid;
use chrono::Utc;

use crate::models::app::{AppCompatibilityRecord, AppSearchQuery, AppSearchResult};
use crate::models::report::{CompatibilityReport, SubmitReportPayload};
use crate::models::runtime::{ResolveRuntimePayload, RuntimeResolution, RiskLevel};
use crate::models::telemetry::{TelemetryEvent, TelemetryEventPayload};
use crate::models::workspace::{AgentWorkspace, WorkspaceCreatePayload, WorkspaceStatus};

const SEED_JSON: &str = include_str!("../../../common/data/compatibility-registry.seed.json");
const CACHE_TTL_SECS: u64 = 15;

struct CacheEntry {
    value: AppSearchResult,
    inserted_at: Instant,
}

pub struct InMemoryRepository {
    pub apps: Vec<AppCompatibilityRecord>,
    reports: Mutex<Vec<CompatibilityReport>>,
    workspaces: Mutex<Vec<AgentWorkspace>>,
    telemetry: Mutex<Vec<TelemetryEvent>>,
    search_cache: Mutex<HashMap<String, CacheEntry>>,
}

impl InMemoryRepository {
    pub fn new() -> Self {
        let apps: Vec<AppCompatibilityRecord> =
            serde_json::from_str(SEED_JSON).expect("Failed to parse seed JSON");
        Self {
            apps,
            reports: Mutex::new(Vec::new()),
            workspaces: Mutex::new(Vec::new()),
            telemetry: Mutex::new(Vec::new()),
            search_cache: Mutex::new(HashMap::new()),
        }
    }

    pub fn search_apps(&self, query: &AppSearchQuery) -> AppSearchResult {
        let cache_key = serde_json::to_string(query).unwrap_or_default();
        {
            let cache = self.search_cache.lock();
            if let Some(entry) = cache.get(&cache_key) {
                if entry.inserted_at.elapsed() < Duration::from_secs(CACHE_TTL_SECS) {
                    return entry.value.clone();
                }
            }
        }

        let filtered: Vec<AppCompatibilityRecord> = self
            .apps
            .iter()
            .filter(|app| {
                if let Some(q) = &query.q {
                    if !q.is_empty() {
                        let q_lower = q.to_lowercase();
                        if !app.name.to_lowercase().contains(&q_lower)
                            && !app.description.to_lowercase().contains(&q_lower)
                            && !app.slug.to_lowercase().contains(&q_lower)
                        {
                            return false;
                        }
                    }
                }
                if let Some(cat) = &query.category {
                    if app.category != *cat {
                        return false;
                    }
                }
                if let Some(level) = &query.compatibility_level {
                    if std::mem::discriminant(&app.compatibility_level) != std::mem::discriminant(level) {
                        return false;
                    }
                }
                if let Some(route) = &query.runtime_route {
                    let route_str = serde_json::to_string(route).unwrap_or_default();
                    let app_route_str = serde_json::to_string(&app.recommended_route).unwrap_or_default();
                    if route_str != app_route_str {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        let total = filtered.len();
        let page = query.page.max(1);
        let page_size = query.page_size.clamp(1, 50);
        let offset = ((page - 1) * page_size) as usize;
        let results = filtered.into_iter().skip(offset).take(page_size as usize).collect();

        let result = AppSearchResult { results, total, page };

        let mut cache = self.search_cache.lock();
        cache.insert(cache_key, CacheEntry { value: result.clone(), inserted_at: Instant::now() });

        result
    }

    pub fn get_app_by_slug(&self, slug: &str) -> Option<AppCompatibilityRecord> {
        self.apps.iter().find(|a| a.slug == slug).cloned()
    }

    pub fn get_compatibility_reports(&self, app_slug: &str) -> Vec<CompatibilityReport> {
        self.reports
            .lock()
            .iter()
            .filter(|r| r.app_slug == app_slug)
            .cloned()
            .collect()
    }

    pub fn submit_report(&self, app_slug: &str, payload: SubmitReportPayload) -> CompatibilityReport {
        let mut reports = self.reports.lock();
        let id = format!("report_{}", reports.len() + 1);
        let report = CompatibilityReport {
            id,
            app_slug: app_slug.to_string(),
            runtime_route: payload.runtime_route,
            worked: payload.worked,
            system_profile: payload.system_profile,
            notes: payload.notes,
            created_at: Utc::now().to_rfc3339(),
        };
        reports.push(report.clone());
        report
    }

    pub fn resolve_runtime(&self, payload: &ResolveRuntimePayload) -> Option<RuntimeResolution> {
        let app = self.get_app_by_slug(&payload.app_slug)?;

        let risk_level = match &app.compatibility_level {
            crate::models::app::CompatibilityLevel::Platinum => RiskLevel::Low,
            crate::models::app::CompatibilityLevel::Gold => RiskLevel::Low,
            crate::models::app::CompatibilityLevel::Silver => RiskLevel::Medium,
            crate::models::app::CompatibilityLevel::Bronze => RiskLevel::High,
            _ => RiskLevel::High,
        };

        let rationale = route_rationale(&app.recommended_route);

        Some(RuntimeResolution {
            app_slug: app.slug,
            recommended_route: app.recommended_route,
            alternative_routes: app.alternative_routes,
            rationale,
            risk_level,
            known_issues: app.known_issues,
        })
    }

    pub fn create_workspace(&self, payload: WorkspaceCreatePayload) -> AgentWorkspace {
        let mut workspaces = self.workspaces.lock();
        let workspace = AgentWorkspace {
            id: Uuid::new_v4().to_string(),
            name: payload.name,
            status: WorkspaceStatus::Idle,
            allowed_paths: payload.allowed_paths,
            network_access: payload.network_access,
            allowed_apps: payload.allowed_apps,
            runtime_routes: payload.runtime_routes,
            created_at: Utc::now().to_rfc3339(),
        };
        workspaces.push(workspace.clone());
        workspace
    }

    pub fn get_workspaces(&self) -> Vec<AgentWorkspace> {
        self.workspaces.lock().clone()
    }

    pub fn get_workspace_by_id(&self, id: &str) -> Option<AgentWorkspace> {
        self.workspaces.lock().iter().find(|w| w.id == id).cloned()
    }

    pub fn update_workspace_status(&self, id: &str, status: WorkspaceStatus) -> Option<AgentWorkspace> {
        let mut workspaces = self.workspaces.lock();
        if let Some(ws) = workspaces.iter_mut().find(|w| w.id == id) {
            ws.status = status;
            Some(ws.clone())
        } else {
            None
        }
    }

    pub fn record_telemetry(&self, payload: TelemetryEventPayload) -> TelemetryEvent {
        let event = TelemetryEvent {
            event: payload.event,
            app_slug: payload.app_slug,
            session_id: payload.session_id,
            fusion_os_version: payload.fusion_os_version,
            arch: payload.arch,
            gpu: payload.gpu,
            ram_gb: payload.ram_gb,
            timestamp: payload.timestamp,
            metadata: payload.metadata,
        };
        self.telemetry.lock().push(event.clone());
        event
    }
}

fn route_rationale(route: &crate::models::app::RuntimeRoute) -> String {
    match route {
        crate::models::app::RuntimeRoute::NativeLinux => {
            "Native Linux binary — best performance, direct hardware access, no compatibility layer.".to_string()
        }
        crate::models::app::RuntimeRoute::Flatpak => {
            "Flatpak sandboxed package — consistent runtime, easy updates, works across distributions.".to_string()
        }
        crate::models::app::RuntimeRoute::Appimage => {
            "AppImage portable binary — no installation required, runs from any directory.".to_string()
        }
        crate::models::app::RuntimeRoute::Apt => {
            "System package manager (apt) — integrated with system, automatic security updates.".to_string()
        }
        crate::models::app::RuntimeRoute::Wine => {
            "Wine compatibility layer — runs Windows binaries without a full VM. Performance varies by app.".to_string()
        }
        crate::models::app::RuntimeRoute::Proton => {
            "Proton (Steam's Wine fork) — optimized for games, includes DXVK/VKD3D for Direct3D translation.".to_string()
        }
        crate::models::app::RuntimeRoute::Container => {
            "Docker/Podman container — fully isolated environment, predictable dependencies.".to_string()
        }
        crate::models::app::RuntimeRoute::Vm => {
            "Virtual machine — maximum compatibility at the cost of performance overhead.".to_string()
        }
        crate::models::app::RuntimeRoute::AgentWorkspace => {
            "Isolated FusionOS agent workspace — sandboxed execution with controlled permissions.".to_string()
        }
        crate::models::app::RuntimeRoute::MacosExperimental => {
            "Experimental macOS compatibility path — research phase only, not production-ready.".to_string()
        }
    }
}

impl AppSearchResult {
    fn clone(&self) -> Self {
        AppSearchResult {
            results: self.results.clone(),
            total: self.total,
            page: self.page,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_repo() -> InMemoryRepository {
        InMemoryRepository::new()
    }

    #[test]
    fn test_seed_data_loads() {
        let repo = make_repo();
        assert_eq!(repo.apps.len(), 10);
    }

    #[test]
    fn test_search_by_name() {
        let repo = make_repo();
        let query = AppSearchQuery {
            q: Some("steam".to_string()),
            category: None,
            compatibility_level: None,
            runtime_route: None,
            page: 1,
            page_size: 20,
        };
        let result = repo.search_apps(&query);
        assert_eq!(result.total, 1);
        assert_eq!(result.results[0].slug, "steam");
    }

    #[test]
    fn test_search_empty_returns_all() {
        let repo = make_repo();
        let query = AppSearchQuery {
            q: None,
            category: None,
            compatibility_level: None,
            runtime_route: None,
            page: 1,
            page_size: 20,
        };
        let result = repo.search_apps(&query);
        assert_eq!(result.total, 10);
    }

    #[test]
    fn test_search_by_category() {
        let repo = make_repo();
        let query = AppSearchQuery {
            q: None,
            category: Some("games".to_string()),
            compatibility_level: None,
            runtime_route: None,
            page: 1,
            page_size: 20,
        };
        let result = repo.search_apps(&query);
        assert!(result.total >= 2);
        for app in &result.results {
            assert_eq!(app.category, "games");
        }
    }

    #[test]
    fn test_get_by_slug_found() {
        let repo = make_repo();
        let app = repo.get_app_by_slug("vscode");
        assert!(app.is_some());
        assert_eq!(app.unwrap().name, "VS Code");
    }

    #[test]
    fn test_get_by_slug_not_found() {
        let repo = make_repo();
        assert!(repo.get_app_by_slug("nonexistent-app").is_none());
    }

    #[test]
    fn test_submit_and_retrieve_report() {
        let repo = make_repo();
        let payload = SubmitReportPayload {
            runtime_route: crate::models::app::RuntimeRoute::NativeLinux,
            worked: true,
            system_profile: crate::models::app::SystemProfile {
                arch: crate::models::app::Arch::X86_64,
                gpu: Some("AMD RX 6600".to_string()),
                ram_gb: 8.0,
                kernel_version: None,
                fusion_os_version: "0.1.0".to_string(),
            },
            notes: "Worked perfectly".to_string(),
        };
        let report = repo.submit_report("steam", payload);
        assert_eq!(report.app_slug, "steam");
        assert!(report.worked);

        let reports = repo.get_compatibility_reports("steam");
        assert_eq!(reports.len(), 1);
    }

    #[test]
    fn test_resolve_runtime_known_app() {
        let repo = make_repo();
        let payload = ResolveRuntimePayload {
            app_slug: "steam".to_string(),
            system_profile: crate::models::app::SystemProfile {
                arch: crate::models::app::Arch::X86_64,
                gpu: None,
                ram_gb: 8.0,
                kernel_version: None,
                fusion_os_version: "0.1.0".to_string(),
            },
        };
        let result = repo.resolve_runtime(&payload);
        assert!(result.is_some());
        let resolution = result.unwrap();
        assert_eq!(resolution.app_slug, "steam");
    }

    #[test]
    fn test_workspace_crud() {
        let repo = make_repo();
        let payload = WorkspaceCreatePayload {
            name: "Test Workspace".to_string(),
            allowed_paths: vec!["/home/user/projects".to_string()],
            network_access: crate::models::workspace::NetworkAccess::Limited,
            allowed_apps: vec![],
            runtime_routes: vec![crate::models::app::RuntimeRoute::Container],
        };
        let ws = repo.create_workspace(payload);
        assert_eq!(ws.name, "Test Workspace");

        let all = repo.get_workspaces();
        assert_eq!(all.len(), 1);

        let found = repo.get_workspace_by_id(&ws.id);
        assert!(found.is_some());
    }
}
