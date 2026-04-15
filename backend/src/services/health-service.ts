import Redis from 'ioredis';
import { Pool } from 'pg';

import { env } from '../config/env';

type DependencyStatus = 'up' | 'down' | 'not_configured';

export type DependencyChecks = {
  checkPostgres: () => Promise<DependencyStatus>;
  checkRedis: () => Promise<DependencyStatus>;
};

export type HealthStatus = {
  status: 'ok' | 'degraded';
  checks: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
  };
  timestamp: string;
};

const checkPostgres = async (): Promise<DependencyStatus> => {
  if (!env.DATABASE_URL) {
    return 'not_configured';
  }

  const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
  try {
    await pool.query('SELECT 1');
    return 'up';
  } catch {
    return 'down';
  } finally {
    await pool.end();
  }
};

const checkRedis = async (): Promise<DependencyStatus> => {
  if (!env.REDIS_URL) {
    return 'not_configured';
  }

  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true
  });

  try {
    await redis.connect();
    await redis.ping();
    return 'up';
  } catch {
    return 'down';
  } finally {
    await redis.quit().catch(() => undefined);
  }
};

export const getHealthStatus = async (
  checks?: Partial<DependencyChecks>
): Promise<HealthStatus> => {
  const checkers: DependencyChecks = {
    checkPostgres,
    checkRedis,
    ...checks
  };

  const [postgres, redis] = await Promise.all([
    checkers.checkPostgres(),
    checkers.checkRedis()
  ]);
  const hasCriticalFailure = [postgres, redis].some((status) => status === 'down');

  return {
    status: hasCriticalFailure ? 'degraded' : 'ok',
    checks: {
      postgres,
      redis
    },
    timestamp: new Date().toISOString()
  };
};
