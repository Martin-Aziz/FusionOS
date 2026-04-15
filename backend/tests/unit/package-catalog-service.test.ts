import { describe, expect, it } from 'vitest';

import type { SearchPackagesQuery } from '../../../common/schemas/registry';
import type { CompatibilityReport, TelemetryEvent } from '../../../common/types/domain';
import { InMemoryRegistryRepository } from '../../src/repositories/registry-repository';
import type { SearchResult } from '../../src/repositories/registry-repository';
import { PackageCatalogService } from '../../src/services/package-catalog-service';

const service = new PackageCatalogService(new InMemoryRegistryRepository());

describe('PackageCatalogService', () => {
  it('returns matching packages for query', async () => {
    const query: SearchPackagesQuery = {
      q: 'studio',
      page: 1,
      pageSize: 10
    };

    const result = await service.searchPackages(query);
    expect(result.total).toBe(1);
    expect(result.results[0]?.id).toBe('pkg_vscode_linux');
  });

  it('filters by ecosystem', async () => {
    const query: SearchPackagesQuery = {
      q: 'gimp',
      ecosystem: 'linux',
      page: 1,
      pageSize: 10
    };

    const result = await service.searchPackages(query);
    expect(result.total).toBe(1);
    expect(result.results[0]?.ecosystem).toBe('linux');
  });

  it('returns empty result for unknown package', async () => {
    const query: SearchPackagesQuery = {
      q: 'nonexistent',
      page: 1,
      pageSize: 10
    };

    const result = await service.searchPackages(query);
    expect(result.total).toBe(0);
    expect(result.results).toEqual([]);
  });

  it('returns package by id', async () => {
    const result = await service.getPackageById('pkg_adobe_photoshop_win32');
    expect(result?.id).toBe('pkg_adobe_photoshop_win32');
  });

  it('caches repeated search queries', async () => {
    let calls = 0;
    const countingRepository = {
      search: (_query: SearchPackagesQuery): Promise<SearchResult> => {
        calls += 1;
        return Promise.resolve({
          results: [],
          total: 0,
          page: 1
        });
      },
      getById: (): Promise<null> => Promise.resolve(null),
      getCompatibilityReports: (): Promise<CompatibilityReport[]> => Promise.resolve([]),
      createCompatibilityReport: (): Promise<CompatibilityReport> =>
        Promise.resolve({
          id: 'compat_test',
          pkgId: 'pkg_test',
          hwProfile: 'hw',
          triosVersion: '0.1.0',
          result: 'works_with_issues',
          notes: 'test',
          createdAt: new Date().toISOString()
        }),
      recordTelemetry: (): Promise<TelemetryEvent> =>
        Promise.resolve({
          event: 'os_boot',
          sessionId: '93fbbffd-7728-4ef8-b9b9-6615048f77c5',
          osVersion: '0.1.0',
          hwProfile: 'hw',
          timestamp: new Date().toISOString()
        })
    };

    const catalogService = new PackageCatalogService(countingRepository);

    const query: SearchPackagesQuery = {
      q: 'cached-query',
      page: 1,
      pageSize: 10
    };

    await catalogService.searchPackages(query);
    await catalogService.searchPackages(query);
    expect(calls).toBe(1);
  });
});
