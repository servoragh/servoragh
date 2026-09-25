/**
 * High-Performance Server-Side In-Memory Cache with Global Persistence
 * Provides ultra-fast sub-millisecond responses for read-heavy routes
 * (Products, Storefronts, User Session lookups)
 */

interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  __servora_server_cache?: Map<string, CacheEntry>;
};

if (!globalForCache.__servora_server_cache) {
  globalForCache.__servora_server_cache = new Map<string, CacheEntry>();
}

const cache = globalForCache.__servora_server_cache;

/**
 * Get cached item if it exists and has not expired
 */
export function getServerCache<T = any>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set cached item with a Time-To-Live in seconds
 */
export function setServerCache<T = any>(key: string, data: T, ttlSeconds: number = 30): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate a specific key or all keys starting with prefix
 */
export function invalidateServerCache(keyOrPrefix: string): void {
  for (const key of cache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      cache.delete(key);
    }
  }
}
