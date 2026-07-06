/**
 * `My shipped playbooks` — operator-owned progress tracker.
 *
 * Each operator tick marks playbooks they have shipped in their own store.
 * State is per-browser (localStorage), keyed by playbook file id (e.g.
 * `01-abandoned-cart-flow-klaviyo`). Survives reloads. Bump the suffix
 * (`v1` → `v2`) when the schema changes incompatibly.
 *
 * Schema: `Record<playbookId, { shippedAt: ISOString; notes?: string }>`.
 * Missing keys = not shipped. Empty object = nothing shipped yet.
 */

export interface ShippedEntry {
  shippedAt: string; // ISO 8601
  notes?: string;
}

export type ShippedMap = Record<string, ShippedEntry>;

export const SHIPPED_PLAYBOOKS_STORAGE_KEY = "ecom-ops:shipped-playbooks:v1";

export function loadShippedPlaybooks(): ShippedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SHIPPED_PLAYBOOKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: ShippedMap = {};
    for (const [k, v] of Object.entries(parsed as ShippedMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as ShippedEntry).shippedAt !== "string") continue;
      out[k] = {
        shippedAt: (v as ShippedEntry).shippedAt,
        notes: typeof (v as ShippedEntry).notes === "string"
          ? (v as ShippedEntry).notes
          : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveShippedPlaybooks(map: ShippedMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHIPPED_PLAYBOOKS_STORAGE_KEY,
      JSON.stringify(map)
    );
  } catch {
    /* quota / private-mode */
  }
}

export function toggleShipped(
  map: ShippedMap,
  playbookId: string
): ShippedMap {
  const next = { ...map };
  if (next[playbookId]) {
    delete next[playbookId];
  } else {
    next[playbookId] = { shippedAt: new Date().toISOString() };
  }
  return next;
}

export function setShippedNotes(
  map: ShippedMap,
  playbookId: string,
  notes: string
): ShippedMap {
  const existing = map[playbookId];
  if (!existing) return map;
  const trimmed = notes.trim();
  const next = { ...map };
  if (trimmed.length === 0) {
    const { notes: _drop, ...rest } = existing;
    next[playbookId] = rest;
  } else {
    next[playbookId] = { ...existing, notes: trimmed };
  }
  return next;
}

export function clearShippedPlaybooks(): ShippedMap {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SHIPPED_PLAYBOOKS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return {};
}

/** Format an ISO timestamp into a compact "YYYY-MM-DD" for the table cell. */
export function formatShippedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}