import { describe, expect, it } from 'vitest';

import { InMemoryRegistryRepository } from '../../src/repositories/registry-repository';

describe('InMemoryRegistryRepository', () => {
  it('creates compatibility reports', async () => {
    const repository = new InMemoryRegistryRepository();

    const report = await repository.createCompatibilityReport({
      pkgId: 'pkg_adobe_photoshop_win32',
      hwProfile: 'nvidia-rtx-4080',
      triosVersion: '0.1.0',
      result: 'works_perfectly',
      notes: 'unit test report'
    });

    expect(report.id).toContain('compat_');

    const reports = await repository.getCompatibilityReports('pkg_adobe_photoshop_win32');
    expect(reports.length).toBeGreaterThan(0);
  });

  it('records telemetry with optional fields', async () => {
    const repository = new InMemoryRegistryRepository();

    const event = await repository.recordTelemetry({
      event: 'app_launched',
      pkgId: 'pkg_adobe_photoshop_win32',
      sessionId: '93fbbffd-7728-4ef8-b9b9-6615048f77c5',
      osVersion: '0.1.0',
      hwProfile: 'intel-i7-13700h',
      timestamp: '2026-04-15T10:00:00.000Z',
      metadata: {
        launchTimeMs: 1200,
        coldStart: true
      }
    });

    expect(event.pkgId).toBe('pkg_adobe_photoshop_win32');
    expect(event.metadata?.coldStart).toBe(true);
  });

  it('records telemetry without optional fields', async () => {
    const repository = new InMemoryRegistryRepository();

    const event = await repository.recordTelemetry({
      event: 'os_boot',
      sessionId: '93fbbffd-7728-4ef8-b9b9-6615048f77c5',
      osVersion: '0.1.0',
      hwProfile: 'intel-i7-13700h',
      timestamp: '2026-04-15T10:01:00.000Z'
    });

    expect(event.pkgId).toBeUndefined();
    expect(event.metadata).toBeUndefined();
  });
});
