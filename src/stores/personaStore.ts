import { ExpertPersona } from "../types";

const BASE_URL = '/api/v1/personas';

// In-memory cache so we don't re-fetch on every tab switch
let _cache: ExpertPersona[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

// ─── Public API (used by Expert tab) ──────────────────────────

/**
 * Fetch all active personas. Uses cache if fresh.
 */
export async function fetchPersonas(): Promise<ExpertPersona[]> {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;

  try {
    const res = await fetch(`${BASE_URL}`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch personas");
    }

    _cache = data.personas || [];
    _cacheTime = now;
    return _cache;
  } catch (err: any) {
    console.warn("fetchPersonas error, using fallback if available:", err);
    if (_cache && _cache.length > 0) return _cache;
    throw err;
  }
}

/**
 * Get the best expert for a given topic.
 * Falls back to the default persona if no domain match.
 */
export async function matchPersonaToTopic(topic: string): Promise<ExpertPersona | null> {
  try {
    const res = await fetch(`${BASE_URL}/match?topic=${encodeURIComponent(topic || '')}`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Matching failed");
    }
    return data.persona || null;
  } catch (err: any) {
    console.warn("matchPersonaToTopic error:", err);
    // Fallback: match from local cache or return first active
    const personas = await fetchPersonas().catch(() => []);
    if (personas.length === 0) return null;
    const lower = (topic || "").toLowerCase();
    const matched = personas.find(p => p.domains?.some(d => lower.includes(d.toLowerCase())));
    return matched || personas.find(p => p.is_default) || personas[0];
  }
}

/**
 * Build the opening message for a persona + topic.
 */
export function buildOpener(persona: ExpertPersona | null, topic: string): string {
  if (!persona) return `How can I help you with ${topic || 'this topic'}?`;
  return (persona.opener_template || `I see you are exploring {topic}. How can I help?`)
    .replace(/\{topic\}/g, topic || 'this topic')
    .replace(/\{name\}/g, persona.name);
}

/**
 * Invalidate the cache (call after any admin write operation)
 */
export function invalidatePersonaCache(): void {
  _cache = null;
  _cacheTime = 0;
}

// ─── Admin API (used by Admin tab only) ───────────────────────

function getAdminHeaders(adminToken?: string): HeadersInit {
  const token = adminToken || localStorage.getItem("admin_token") || "";
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": token,
  };
}

/**
 * Fetch ALL personas including inactive (admin only)
 */
export async function adminFetchAll(adminToken?: string): Promise<ExpertPersona[]> {
  const res = await fetch(`${BASE_URL}/admin/all`, {
    headers: getAdminHeaders(adminToken),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch all personas");
  }
  return data.personas || [];
}

/**
 * Create a new persona
 */
export async function adminCreatePersona(
  personaData: Partial<ExpertPersona>,
  adminToken?: string
): Promise<ExpertPersona> {
  const res = await fetch(`${BASE_URL}/admin/create`, {
    method: "POST",
    headers: getAdminHeaders(adminToken),
    body: JSON.stringify(personaData),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to create persona");
  }
  invalidatePersonaCache();
  return data.persona;
}

/**
 * Update any field of a persona
 */
export async function adminUpdatePersona(
  id: string,
  updates: Partial<ExpertPersona>,
  adminToken?: string
): Promise<ExpertPersona> {
  const res = await fetch(`${BASE_URL}/admin/${id}`, {
    method: "PATCH",
    headers: getAdminHeaders(adminToken),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to update persona");
  }
  invalidatePersonaCache();
  return data.persona;
}

/**
 * Soft delete (deactivate) a persona, or hard delete
 */
export async function adminDeletePersona(
  id: string,
  hard: boolean = false,
  adminToken?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/admin/${id}?hard=${hard}`, {
    method: "DELETE",
    headers: getAdminHeaders(adminToken),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to delete persona");
  }
  invalidatePersonaCache();
  return data;
}

/**
 * Toggle a persona active/inactive
 */
export async function adminTogglePersona(
  id: string,
  is_active: boolean,
  adminToken?: string
): Promise<ExpertPersona> {
  return adminUpdatePersona(id, { is_active }, adminToken);
}

/**
 * Reorder display order
 */
export async function adminReorderPersona(
  id: string,
  display_order: number,
  adminToken?: string
): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/admin/${id}/reorder`, {
    method: "PATCH",
    headers: getAdminHeaders(adminToken),
    body: JSON.stringify({ display_order }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to reorder persona");
  }
  invalidatePersonaCache();
  return true;
}
