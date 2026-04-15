export type Ecosystem = 'linux' | 'windows' | 'macos';

export type PackageRecord = {
  id: string;
  name: string;
  version: string;
  ecosystem: Ecosystem;
  installMethod: string;
  sourceUrl: string;
  sha256: string;
  dependencies: string[];
  compatibilityScore: number;
  testedHardware: string[];
  createdAt: string;
};

export type CompatibilityReport = {
  id: string;
  pkgId: string;
  hwProfile: string;
  triosVersion: string;
  result: 'works_perfectly' | 'works_with_issues' | 'fails_to_launch';
  notes: string;
  createdAt: string;
};

export type TelemetryEvent = {
  event:
    | 'os_boot'
    | 'app_installed'
    | 'app_launched'
    | 'app_crashed'
    | 'compat_issue_reported'
    | 'env_switch';
  pkgId?: string;
  sessionId: string;
  osVersion: string;
  hwProfile: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
};
