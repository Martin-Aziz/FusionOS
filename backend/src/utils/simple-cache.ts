type CacheValue<T> = {
  value: T;
  expiresAt: number;
};

export class SimpleCache<T> {
  private readonly store = new Map<string, CacheValue<T>>();

  public set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  public get(key: string): T | null {
    const cached = this.store.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return cached.value;
  }
}
