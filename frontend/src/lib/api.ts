import type {
  AppCompatibilityRecord,
  AppSearchQuery,
  AppSearchResult,
  CompatibilityReport,
  RuntimeResolution,
  AgentWorkspace
} from '../types';

const BASE = '/api/v1';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchApps(
  params: Partial<AppSearchQuery> = {}
): Promise<AppSearchResult> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.compatibilityLevel) qs.set('compatibility_level', params.compatibilityLevel);
  if (params.runtimeRoute) qs.set('runtime_route', params.runtimeRoute);
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('page_size', String(params.pageSize));
  return fetchJSON<AppSearchResult>(`${BASE}/apps/search?${qs}`);
}

export async function getApp(slug: string): Promise<AppCompatibilityRecord> {
  return fetchJSON<AppCompatibilityRecord>(`${BASE}/apps/${slug}`);
}

export async function getCompatibilityReports(slug: string): Promise<{ reports: CompatibilityReport[] }> {
  return fetchJSON<{ reports: CompatibilityReport[] }>(`${BASE}/apps/${slug}/compatibility`);
}

export interface SubmitReportPayload {
  runtimeRoute: string;
  worked: boolean;
  systemProfile: {
    arch: 'x86_64' | 'arm64';
    gpu?: string;
    ramGb: number;
    fusionOsVersion: string;
  };
  notes: string;
}

export async function submitReport(
  slug: string,
  payload: SubmitReportPayload
): Promise<{ id: string; accepted: boolean }> {
  return fetchJSON(`${BASE}/apps/${slug}/reports`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function resolveRuntime(
  appSlug: string,
  systemProfile: SubmitReportPayload['systemProfile']
): Promise<RuntimeResolution> {
  return fetchJSON(`${BASE}/runtime/resolve`, {
    method: 'POST',
    body: JSON.stringify({ appSlug, systemProfile })
  });
}

export async function getWorkspaces(): Promise<{ workspaces: AgentWorkspace[] }> {
  return fetchJSON(`${BASE}/workspaces`);
}

export interface WorkspaceCreatePayload {
  name: string;
  allowedPaths: string[];
  networkAccess: 'none' | 'limited' | 'full';
  allowedApps: string[];
  runtimeRoutes: string[];
}

export async function createWorkspace(payload: WorkspaceCreatePayload): Promise<AgentWorkspace> {
  return fetchJSON(`${BASE}/workspaces`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function runWorkspace(id: string): Promise<AgentWorkspace> {
  return fetchJSON(`${BASE}/workspaces/${id}/run`, { method: 'POST', body: '{}' });
}

export async function getWorkspaceLogs(id: string): Promise<{ logs: string[] }> {
  return fetchJSON(`${BASE}/workspaces/${id}/logs`);
}
