import { CategoryApiResponse, CategoryType } from "../types";

// In-Memory Caches
const clientMemoryCache = new Map<string, { data: CategoryApiResponse; expiresAt: number }>();
const autocompleteCache = new Map<string, { data: Array<{ title: string; description: string; type: string }>; expiresAt: number }>();

const CLIENT_CACHE_TTL = 1000 * 60 * 15; // 15 minutes client cache
const AUTOCOMPLETE_CACHE_TTL = 1000 * 60 * 10; // 10 minutes autocomplete cache

// In-Flight Promise Maps for Request Deduplication
const inFlightCategoryRequests = new Map<string, Promise<CategoryApiResponse>>();
const inFlightAutocompleteRequests = new Map<string, Promise<Array<{ title: string; description: string; type: string }>>>();

/**
 * Invalidate client cache entries for a specific category, topic, or all
 */
export function invalidateCache(topic?: string, category?: CategoryType) {
  if (!topic && !category) {
    clientMemoryCache.clear();
    autocompleteCache.clear();
    return;
  }

  const topicLower = topic?.toLowerCase();
  for (const [key] of clientMemoryCache.keys()) {
    const matchesTopic = topicLower ? key.includes(topicLower) : true;
    const matchesCategory = category ? key.startsWith(`${category}:`) : true;
    if (matchesTopic && matchesCategory) {
      clientMemoryCache.delete(key);
    }
  }
}

export async function fetchAutocomplete(query: string, signal?: AbortSignal): Promise<Array<{ title: string; description: string; type: string }>> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();
  
  // 1. Check Autocomplete Cache
  const cached = autocompleteCache.get(cleanQuery);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // 2. Request Deduplication: Return pending in-flight promise if identical query is currently fetching
  if (inFlightAutocompleteRequests.has(cleanQuery)) {
    return inFlightAutocompleteRequests.get(cleanQuery)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(cleanQuery)}`, { signal });
      if (!res.ok) throw new Error("Autocomplete request failed");
      const data = await res.json();
      const suggestions = data.suggestions || [];

      // Cache result
      autocompleteCache.set(cleanQuery, {
        data: suggestions,
        expiresAt: Date.now() + AUTOCOMPLETE_CACHE_TTL,
      });

      return suggestions;
    } catch (err: any) {
      if (err.name === "AbortError") return [];
      console.warn("Autocomplete fetch error:", err);
      return [
        { title: query, description: `Deep dive into ${query}`, type: "topic" },
        { title: `${query} research papers`, description: `Scholarly works on ${query}`, type: "topic" },
      ];
    } finally {
      inFlightAutocompleteRequests.delete(cleanQuery);
    }
  })();

  inFlightAutocompleteRequests.set(cleanQuery, fetchPromise);
  return fetchPromise;
}

export async function fetchCategoryData<T = any>(
  topic: string,
  category: CategoryType,
  page = 1,
  limit = 10,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<CategoryApiResponse<T>> {
  const cacheKey = `${category}:${topic.toLowerCase()}:p${page}:l${limit}`;

  if (!forceRefresh) {
    const cached = clientMemoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as CategoryApiResponse<T>;
    }
  }

  // Request Deduplication: Avoid duplicate concurrent network requests
  if (!forceRefresh && inFlightCategoryRequests.has(cacheKey)) {
    return inFlightCategoryRequests.get(cacheKey) as Promise<CategoryApiResponse<T>>;
  }

  const url = `/api/category/${category}?q=${encodeURIComponent(topic)}&page=${page}&limit=${limit}`;

  const requestPromise = (async () => {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}: Failed to fetch ${category}`);
      }

      const data: CategoryApiResponse<T> = await res.json();

      // Cache successful response
      clientMemoryCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CLIENT_CACHE_TTL,
      });

      return data;
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw err;
      }
      console.error(`Error fetching category '${category}':`, err);
      throw err;
    } finally {
      inFlightCategoryRequests.delete(cacheKey);
    }
  })();

  inFlightCategoryRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

