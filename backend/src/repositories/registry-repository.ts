import type {
  CompatibilityReport,
  Ecosystem,
  PackageRecord,
  TelemetryEvent
} from '../../../common/types/domain';

import type {
  SearchPackagesQuery,
  SubmitCompatibilityPayload,
  TelemetryEventPayload
} from '../../../common/schemas/registry';

export type SearchResult = {
  results: PackageRecord[];
  total: number;
  page: number;
};

export type RegistryRepository = {
  search: (query: SearchPackagesQuery) => Promise<SearchResult>;
  getById: (id: string) => Promise<PackageRecord | null>;
  getCompatibilityReports: (pkgId: string) => Promise<CompatibilityReport[]>;
  createCompatibilityReport: (
    payload: SubmitCompatibilityPayload
  ) => Promise<CompatibilityReport>;
  recordTelemetry: (payload: TelemetryEventPayload) => Promise<TelemetryEvent>;
};

const seedPackages: PackageRecord[] = [
  {
    id: 'pkg_adobe_photoshop_win32',
    name: 'Adobe Photoshop',
    version: '25.9.1',
    ecosystem: 'windows',
    installMethod: 'winenv_msi',
    sourceUrl: 'https://packages.trios.io/win/photoshop-25.9.1.msi',
    sha256: 'a3f4b2e817c3915d8142f91872de20113ee082b4fdd7d4768aaaf8dd9ba2fc1b',
    dependencies: ['vcredist2022', 'dotnet48'],
    compatibilityScore: 94,
    testedHardware: ['intel-iris-xe', 'nvidia-rtx-3070'],
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'pkg_gimp_linux',
    name: 'GIMP',
    version: '2.10.38',
    ecosystem: 'linux',
    installMethod: 'apt',
    sourceUrl: 'https://packages.trios.io/linux/gimp-2.10.38.deb',
    sha256: '10f5b48ebf136f49276f3c9524bbf7041f29d7989f2a1f2ac8ca4cdbf9709fe3',
    dependencies: ['glib2', 'gtk3'],
    compatibilityScore: 99,
    testedHardware: ['intel-iris-xe', 'amd-radeon-780m'],
    createdAt: '2026-01-16T00:00:00.000Z'
  },
  {
    id: 'pkg_vscode_linux',
    name: 'Visual Studio Code',
    version: '1.100.0',
    ecosystem: 'linux',
    installMethod: 'apt',
    sourceUrl: 'https://packages.trios.io/linux/code_1.100.0_amd64.deb',
    sha256: '9a90fcaec1937059d9d4d9baed388eb969034ebecf85a06eaf6024f88f7f6f71',
    dependencies: ['libx11-6'],
    compatibilityScore: 100,
    testedHardware: ['intel-iris-xe', 'nvidia-rtx-4080'],
    createdAt: '2026-01-20T00:00:00.000Z'
  }
];

const compatibilityReports: CompatibilityReport[] = [];
const telemetryEvents: TelemetryEvent[] = [];

const matchesQuery = (name: string, query: string): boolean =>
  name.toLowerCase().includes(query.toLowerCase());

const filterByEcosystem = (
  packages: PackageRecord[],
  ecosystem: Ecosystem | undefined
): PackageRecord[] => {
  if (!ecosystem) {
    return packages;
  }

  return packages.filter((pkg) => pkg.ecosystem === ecosystem);
};

export class InMemoryRegistryRepository implements RegistryRepository {
  public search(query: SearchPackagesQuery): Promise<SearchResult> {
    const filteredByName = seedPackages.filter((pkg) => matchesQuery(pkg.name, query.q));
    const filteredByEcosystem = filterByEcosystem(filteredByName, query.ecosystem);

    const offset = (query.page - 1) * query.pageSize;
    const paginated = filteredByEcosystem.slice(offset, offset + query.pageSize);

    return Promise.resolve({
      results: paginated,
      total: filteredByEcosystem.length,
      page: query.page
    });
  }

  public getById(id: string): Promise<PackageRecord | null> {
    return Promise.resolve(seedPackages.find((pkg) => pkg.id === id) ?? null);
  }

  public getCompatibilityReports(pkgId: string): Promise<CompatibilityReport[]> {
    return Promise.resolve(compatibilityReports.filter((report) => report.pkgId === pkgId));
  }

  public createCompatibilityReport(
    payload: SubmitCompatibilityPayload
  ): Promise<CompatibilityReport> {
    const report: CompatibilityReport = {
      id: `compat_${compatibilityReports.length + 1}`,
      pkgId: payload.pkgId,
      hwProfile: payload.hwProfile,
      triosVersion: payload.triosVersion,
      result: payload.result,
      notes: payload.notes,
      createdAt: new Date().toISOString()
    };

    compatibilityReports.push(report);
    return Promise.resolve(report);
  }

  public recordTelemetry(payload: TelemetryEventPayload): Promise<TelemetryEvent> {
    const event: TelemetryEvent = {
      event: payload.event,
      sessionId: payload.sessionId,
      osVersion: payload.osVersion,
      hwProfile: payload.hwProfile,
      timestamp: payload.timestamp
    };

    if (payload.pkgId) {
      event.pkgId = payload.pkgId;
    }

    if (payload.metadata) {
      event.metadata = payload.metadata;
    }

    telemetryEvents.push(event);
    return Promise.resolve(event);
  }
}
