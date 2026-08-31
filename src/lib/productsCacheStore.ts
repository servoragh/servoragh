// Client-side Instant Data Cache & Stale-While-Revalidate (SWR) Engine

const memoryCache = new Map<string, { products: any[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache lifetime

export function getCachedProducts(key: string): any[] | null {
  // 1. Check in-memory Map
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key)!;
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.products;
    }
  }

  // 2. Check sessionStorage fallback for instant page back-navigation
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const stored = sessionStorage.getItem(`servora_products_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache.set(key, parsed);
          return parsed.products;
        }
      }
    } catch (_) {}
  }

  return null;
}

export function setCachedProducts(key: string, products: any[]) {
  const entry = { products, timestamp: Date.now() };
  memoryCache.set(key, entry);

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      sessionStorage.setItem(`servora_products_${key}`, JSON.stringify(entry));
    } catch (_) {}
  }
}
