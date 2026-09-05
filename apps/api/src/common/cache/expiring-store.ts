/**
 * Short-lived cache port for coordination data.
 *
 * In-memory is the local default. A Redis adapter can implement this port
 * when the API runs across multiple instances; domain services stay unaware
 * of the infrastructure choice.
 */
export interface ExpiringStore<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs: number): void;
  delete(key: string): void;
  size(): number;
  prune(now?: number): void;
}

type Entry<T> = { value: T; expiresAt: number };

export class InMemoryExpiringStore<T> implements ExpiringStore<T> {
  private readonly entries = new Map<string, Entry<T>>();

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.entries.set(key, { value, expiresAt: Date.now() + Math.max(0, ttlMs) });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  size(): number {
    return this.entries.size;
  }

  prune(now = Date.now()): void {
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}
