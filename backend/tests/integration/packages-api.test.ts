import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app';

const app = buildApp();

type SearchResponse = {
  total: number;
  results: Array<{ id: string; ecosystem: string }>;
};

type ErrorResponse = {
  error: string;
};

type CompatibilityResponse = {
  reports: Array<{ id: string }>;
};

type AcceptedResponse = {
  accepted: boolean;
};

describe('Packages API', () => {
  it('returns search results', async () => {
    const response = await request(app)
      .get('/api/v1/packages/search')
      .query({ q: 'photoshop', page: 1, pageSize: 10 });

    const body = response.body as SearchResponse;

    expect(response.statusCode).toBe(200);
    expect(body.total).toBe(1);
    expect(body.results[0]?.ecosystem).toBe('windows');
  });

  it('returns package details for known package id', async () => {
    const response = await request(app).get('/api/v1/packages/pkg_adobe_photoshop_win32');
    const body = response.body as { id: string; ecosystem: string };

    expect(response.statusCode).toBe(200);
    expect(body.id).toBe('pkg_adobe_photoshop_win32');
    expect(body.ecosystem).toBe('windows');
  });

  it('returns 404 for unknown package id', async () => {
    const response = await request(app).get('/api/v1/packages/unknown_package');
    const body = response.body as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(body.error).toBe('Package not found');
  });

  it('creates and lists compatibility reports', async () => {
    const create = await request(app).post('/api/v1/compat/submit').send({
      pkgId: 'pkg_adobe_photoshop_win32',
      hwProfile: 'intel-iris-xe',
      triosVersion: '0.1.0',
      result: 'works_perfectly',
      notes: 'integration test report'
    });

    expect(create.statusCode).toBe(201);

    const list = await request(app).get('/api/v1/packages/pkg_adobe_photoshop_win32/compat');
    const body = list.body as CompatibilityResponse;

    expect(list.statusCode).toBe(200);
    expect(body.reports.length).toBeGreaterThan(0);
  });

  it('accepts telemetry events', async () => {
    const response = await request(app).post('/api/v1/telemetry').send({
      event: 'app_launched',
      pkgId: 'pkg_adobe_photoshop_win32',
      sessionId: '93fbbffd-7728-4ef8-b9b9-6615048f77c5',
      osVersion: '0.1.0',
      hwProfile: 'intel-i7-13700h',
      timestamp: '2026-04-15T09:30:00.000Z'
    });

    const body = response.body as AcceptedResponse;
    expect(response.statusCode).toBe(202);
    expect(body.accepted).toBe(true);
  });

  it('serves Prometheus metrics payload', async () => {
    const response = await request(app).get('/metrics');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('trios_http_request_duration_seconds');
  });

  it('returns not found response for unknown route', async () => {
    const response = await request(app).get('/does-not-exist');
    const body = response.body as ErrorResponse;

    expect(response.statusCode).toBe(404);
    expect(body.error).toBe('Resource not found');
  });

  it('returns generic 500 response for unexpected errors', async () => {
    const response = await request(app).get('/api/v1/testing/error');
    const body = response.body as ErrorResponse;

    expect(response.statusCode).toBe(500);
    expect(body.error).toBe('Internal server error');
  });

  it('rejects invalid search payload', async () => {
    const response = await request(app)
      .get('/api/v1/packages/search')
      .query({ q: '', page: 1, pageSize: 10 });

    const body = response.body as ErrorResponse;

    expect(response.statusCode).toBe(400);
    expect(body.error).toBe('Invalid request payload');
  });
});
