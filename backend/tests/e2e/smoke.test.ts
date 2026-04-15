import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app';

const app = buildApp();

type SearchResponse = {
  results: Array<{ id: string }>;
};

type CompatibilitySubmitResponse = {
  accepted: boolean;
};

describe('Smoke Journey', () => {
  it('completes health to compatibility submission flow', async () => {
    const health = await request(app).get('/health');
    expect([200, 503]).toContain(health.statusCode);

    const search = await request(app)
      .get('/api/v1/packages/search')
      .query({ q: 'photoshop', page: 1, pageSize: 10 });

    const searchBody = search.body as SearchResponse;
    expect(search.statusCode).toBe(200);

    const packageId = searchBody.results[0]?.id;
    expect(packageId).toBeTypeOf('string');

    const compatResponse = await request(app)
      .post('/api/v1/compat/submit')
      .send({
        pkgId: packageId,
        hwProfile: 'nvidia-rtx-4080',
        triosVersion: '0.1.0',
        result: 'works_perfectly',
        notes: 'Smoke test compatibility submission'
      });

    const submitBody = compatResponse.body as CompatibilitySubmitResponse;

    expect(compatResponse.statusCode).toBe(201);
    expect(submitBody.accepted).toBe(true);
  });
});
