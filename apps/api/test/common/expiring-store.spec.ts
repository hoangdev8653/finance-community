import { InMemoryExpiringStore } from '../../src/common/cache/expiring-store';

describe('InMemoryExpiringStore', () => {
  it('returns values before their TTL and expires them afterwards', () => {
    const store = new InMemoryExpiringStore<string>();
    store.set('key', 'value', 10);

    expect(store.get('key')).toBe('value');
    store.prune(Date.now() + 11);
    expect(store.get('key')).toBeUndefined();
  });

  it('prunes expired entries without affecting live entries', () => {
    const store = new InMemoryExpiringStore<number>();
    const now = Date.now();
    store.set('expired', 1, 1);
    store.set('live', 2, 1000);

    store.prune(now + 2);

    expect(store.size()).toBe(1);
    expect(store.get('live')).toBe(2);
  });
});
