import { CategoryApiResponse, CategoryType } from "../types";

// In-Memory Caches
const clientMemoryCache = new Map<string, { data: CategoryApiResponse; expiresAt: number }>();
const autocompleteCache = new Map<string, { data: Array<{ title: string; description: string; type: string }>; expiresAt: number }>();

// In-Flight Promise Maps for Request Deduplication
const inFlightCategoryRequests = new Map<string, Promise<CategoryApiResponse<any>>>();
const inFlightAutocompleteRequests = new Map<string, Promise<Array<{ title: string; description: string; type: string }>>>();

const CLIENT_CACHE_TTL = 1000 * 60 * 15; // 15 minutes client cache
const AUTOCOMPLETE_CACHE_TTL = 1000 * 60 * 10; // 10 minutes autocomplete cache

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("bifrost_session_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function fetchTabUsage(tab: CategoryType) {
  try {
    const res = await fetch(`/api/usage?tab=${tab}`, {
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch tab usage");
    return await res.json();
  } catch (err) {
    console.warn("fetchTabUsage error:", err);
    return { loggedIn: false, tab, limit: 0, count: 0, remaining: 0, resetInSeconds: 86400 };
  }
}

export async function fetchHistory() {
  try {
    const res = await fetch("/api/history", {
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
      if (res.status === 401) return [];
      throw new Error("Failed to fetch search history");
    }
    const data = await res.json();
    return data.history || [];
  } catch (err) {
    console.warn("fetchHistory error:", err);
    return [];
  }
}

export async function addHistoryItem(query: string, category: CategoryType) {
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ query, category }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.item;
  } catch (err) {
    console.warn("addHistoryItem error:", err);
    return null;
  }
}

export async function updateHistoryItem(id: string, updates: { isPinned?: boolean; isStarred?: boolean; displayOrder?: number }) {
  try {
    const res = await fetch(`/api/history/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err) {
    console.warn("updateHistoryItem error:", err);
    return false;
  }
}

export async function deleteHistoryItem(id: string) {
  try {
    const res = await fetch(`/api/history/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    return res.ok;
  } catch (err) {
    console.warn("deleteHistoryItem error:", err);
    return false;
  }
}

export async function clearHistory() {
  try {
    const res = await fetch("/api/history", {
      method: "DELETE",
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    return res.ok;
  } catch (err) {
    console.warn("clearHistory error:", err);
    return false;
  }
}

export async function googleLogin(payload: { idToken?: string; credential?: string; email?: string; name?: string; avatarUrl?: string }) {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Google login failed");
  }
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("bifrost_session_token", data.token);
  }
  return data;
}

export async function logoutUser() {
  localStorage.removeItem("bifrost_session_token");
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });
  return res.ok;
}

export async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn("fetchCurrentUser error:", err);
    return null;
  }
}

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
  for (const key of Array.from(clientMemoryCache.keys())) {
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
  signal?: AbortSignal,
  matchMode?: string
): Promise<CategoryApiResponse<T>> {
  const cacheKey = category === "research" && matchMode
    ? `${category}:${topic.toLowerCase()}:p${page}:l${limit}:m${matchMode}`
    : `${category}:${topic.toLowerCase()}:p${page}:l${limit}`;

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

  const url = category === "research" && matchMode
    ? `/api/category/${category}?q=${encodeURIComponent(topic)}&page=${page}&limit=${limit}&matchMode=${matchMode}`
    : `/api/category/${category}?q=${encodeURIComponent(topic)}&page=${page}&limit=${limit}`;

  const requestPromise = (async () => {
    let attempts = 0;
    const maxAttempts = 2; // Automatic 1 retry for transient network hiccups

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await fetch(url, {
          signal,
          credentials: "include",
          headers: { ...getAuthHeaders() },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status >= 500 && attempts < maxAttempts && !signal?.aborted) {
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to fetch ${category}`);
        }

        const data: CategoryApiResponse<T> = await res.json();

        // Cache successful response
        clientMemoryCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + CLIENT_CACHE_TTL,
        });

        return data;
      } catch (err: any) {
        if (err.name === "AbortError" || signal?.aborted) {
          throw err;
        }
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        console.error(`Error fetching category '${category}':`, err);
        throw err;
      }
    }

    throw new Error(`Failed to load ${category} data after retry.`);
  })();

  inFlightCategoryRequests.set(cacheKey, requestPromise);
  return requestPromise.finally(() => {
    inFlightCategoryRequests.delete(cacheKey);
  });
}

