import { describe, expect, it } from 'vitest';

import { getHealthStatus } from '../../src/services/health-service';

describe('getHealthStatus', () => {
  it('returns ok when dependencies are up', async () => {
    const status = await getHealthStatus({
      checkPostgres: () => Promise.resolve('up'),
      checkRedis: () => Promise.resolve('up')
    });

    expect(status.status).toBe('ok');
    expect(status.checks.postgres).toBe('up');
    expect(status.checks.redis).toBe('up');
  });

  it('returns degraded when any dependency is down', async () => {
    const status = await getHealthStatus({
      checkPostgres: () => Promise.resolve('down'),
      checkRedis: () => Promise.resolve('up')
    });

    expect(status.status).toBe('degraded');
    expect(status.checks.postgres).toBe('down');
  });

  it('returns ok when dependencies are not configured', async () => {
    const status = await getHealthStatus({
      checkPostgres: () => Promise.resolve('not_configured'),
      checkRedis: () => Promise.resolve('not_configured')
    });

    expect(status.status).toBe('ok');
    expect(status.checks.redis).toBe('not_configured');
  });
});
