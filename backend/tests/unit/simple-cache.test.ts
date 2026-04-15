import { describe, expect, it } from 'vitest';

import { SimpleCache } from '../../src/utils/simple-cache';

describe('SimpleCache', () => {
  it('returns null for unknown keys', () => {
    const cache = new SimpleCache<string>();
    expect(cache.get('unknown')).toBeNull();
  });

  it('returns cached value before expiration', () => {
    const cache = new SimpleCache<string>();
    cache.set('key', 'value', 1_000);

    expect(cache.get('key')).toBe('value');
  });

  it('evicts value after expiration', async () => {
    const cache = new SimpleCache<string>();
    cache.set('key', 'value', 1);

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(cache.get('key')).toBeNull();
  });
});
