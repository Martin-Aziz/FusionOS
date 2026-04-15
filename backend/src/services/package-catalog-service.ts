import type {
  SearchPackagesQuery,
  SubmitCompatibilityPayload,
  TelemetryEventPayload
} from '../../../common/schemas/registry';
import type { CompatibilityReport, PackageRecord } from '../../../common/types/domain';

import type { RegistryRepository, SearchResult } from '../repositories/registry-repository';
import { SimpleCache } from '../utils/simple-cache';

const SEARCH_CACHE_TTL_MS = 15_000;

const buildCacheKey = (query: SearchPackagesQuery): string =>
  JSON.stringify({
    q: query.q,
    ecosystem: query.ecosystem ?? 'all',
    page: query.page,
    pageSize: query.pageSize
  });

export class PackageCatalogService {
  private readonly searchCache = new SimpleCache<SearchResult>();

  public constructor(private readonly repository: RegistryRepository) {}

  public async searchPackages(query: SearchPackagesQuery): Promise<SearchResult> {
    const cacheKey = buildCacheKey(query);
    const cached = this.searchCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.repository.search(query);
    this.searchCache.set(cacheKey, result, SEARCH_CACHE_TTL_MS);
    return result;
  }

  public async getPackageById(id: string): Promise<PackageRecord | null> {
    return this.repository.getById(id);
  }

  public async getCompatibilityReports(pkgId: string): Promise<CompatibilityReport[]> {
    return this.repository.getCompatibilityReports(pkgId);
  }

  public async submitCompatibilityReport(
    payload: SubmitCompatibilityPayload
  ): Promise<CompatibilityReport> {
    return this.repository.createCompatibilityReport(payload);
  }

  public async recordTelemetry(payload: TelemetryEventPayload): Promise<void> {
    await this.repository.recordTelemetry(payload);
  }
}
