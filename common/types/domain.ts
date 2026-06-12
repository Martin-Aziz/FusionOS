export type RuntimeRoute =
  | 'native-linux'
  | 'flatpak'
  | 'appimage'
  | 'apt'
  | 'wine'
  | 'proton'
  | 'container'
  | 'vm'
  | 'agent-workspace'
  | 'macos-experimental';

export type CompatibilityLevel =
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'experimental'
  | 'unsupported'
  | 'unknown';

export type KnownIssue = {
  id: string;
  title: string;
  severity: 'blocking' | 'major' | 'minor';
  description: string;
  workaround?: string;
};

export type HardwareNote = {
  component: 'gpu' | 'cpu' | 'ram' | 'storage' | 'network';
  note: string;
};

export type GameSupport = {
  engine?: string;
  anticheatRisk: boolean;
  anticheatNotes?: string;
  protonDbRating?: string;
  controllerSupport?: boolean;
  launchers?: string[];
};

export type SystemProfile = {
  arch: 'x86_64' | 'arm64';
  gpu?: string;
  ramGb: number;
  kernelVersion?: string;
  fusionOsVersion: string;
};

export type InstallAction = {
  method: RuntimeRoute;
  command: string;
  notes?: string;
};

export type AppCompatibilityRecord = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  recommendedRoute: RuntimeRoute;
  alternativeRoutes: RuntimeRoute[];
  compatibilityLevel: CompatibilityLevel;
  knownIssues: KnownIssue[];
  hardwareNotes: HardwareNote[];
  gameSupport?: GameSupport;
  lastVerifiedAt: string;
  reportCount: number;
  installAction?: InstallAction;
};

export type CompatibilityReport = {
  id: string;
  appSlug: string;
  runtimeRoute: RuntimeRoute;
  worked: boolean;
  systemProfile: SystemProfile;
  notes: string;
  createdAt: string;
};

export type AgentWorkspace = {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'failed' | 'stopped';
  allowedPaths: string[];
  networkAccess: 'none' | 'limited' | 'full';
  allowedApps: string[];
  runtimeRoutes: RuntimeRoute[];
  createdAt: string;
};

export type TelemetryEventType =
  | 'os_boot'
  | 'app_installed'
  | 'app_launched'
  | 'app_crashed'
  | 'compat_report_submitted'
  | 'workspace_created'
  | 'workspace_started'
  | 'runtime_resolved';

export type TelemetryEvent = {
  event: TelemetryEventType;
  appSlug?: string;
  sessionId: string;
  fusionOsVersion: string;
  arch: 'x86_64' | 'arm64';
  gpu?: string;
  ramGb: number;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
};

export type RuntimeResolution = {
  appSlug: string;
  recommendedRoute: RuntimeRoute;
  alternativeRoutes: RuntimeRoute[];
  rationale: string;
  riskLevel: 'low' | 'medium' | 'high';
  knownIssues: KnownIssue[];
};

export type AppSearchQuery = {
  q?: string;
  category?: string;
  compatibilityLevel?: CompatibilityLevel;
  runtimeRoute?: RuntimeRoute;
  page: number;
  pageSize: number;
};

export type AppSearchResult = {
  results: AppCompatibilityRecord[];
  total: number;
  page: number;
};
