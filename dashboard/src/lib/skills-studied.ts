/**
 * `My studied skills` — operator-owned progress tracker for the skill
 * library (mirrors `shipped-playbooks.ts` but for /skills).
 *
 * Each operator tick marks skills they have studied / internalized.
 * State is per-browser (localStorage), keyed by skill file id (e.g.
 * `01-abandoned-cart-recovery`). Survives reloads.
 *
 * Schema: `Record<skillId, { studiedAt: ISOString; confidence?: "studied" | "applied" | "shipped"; notes?: string }>`.
 * Missing keys = not studied. Empty object = nothing studied yet.
 *
 * Confidence ladder:
 *   - studied  — read the skill once, internalized the framework
 *   - applied  — ran the framework in the operator's own store (or a
 *                staging replica) but didn't ship to production
 *   - shipped  — running in production; the highest tier
 */

export interface StudiedEntry {
  studiedAt: string; // ISO 8601
  confidence?: "studied" | "applied" | "shipped";
  notes?: string;
}

export type StudiedMap = Record<string, StudiedEntry>;

export const STUDIED_SKILLS_STORAGE_KEY = "ecom-ops:skills:studied:v1";

export function loadStudiedSkills(): StudiedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STUDIED_SKILLS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: StudiedMap = {};
    for (const [k, v] of Object.entries(parsed as StudiedMap)) {
      if (!v || typeof v !== "object") continue;
      if (typeof (v as StudiedEntry).studiedAt !== "string") continue;
      const conf = (v as StudiedEntry).confidence;
      const safeConf: StudiedEntry["confidence"] =
        conf === "applied" || conf === "shipped" ? conf : "studied";
      out[k] = {
        studiedAt: (v as StudiedEntry).studiedAt,
        confidence: safeConf,
        notes:
          typeof (v as StudiedEntry).notes === "string"
            ? (v as StudiedEntry).notes
            : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function saveStudiedSkills(map: StudiedMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STUDIED_SKILLS_STORAGE_KEY,
      JSON.stringify(map),
    );
  } catch {
    /* quota / private-mode */
  }
}

export function isStudied(map: StudiedMap, skillId: string): boolean {
  return Boolean(map[skillId]);
}

export function setStudied(
  map: StudiedMap,
  skillId: string,
  confidence: StudiedEntry["confidence"] = "studied",
): StudiedMap {
  return {
    ...map,
    [skillId]: {
      studiedAt: new Date().toISOString(),
      confidence,
    },
  };
}

export function setStudiedNotes(
  map: StudiedMap,
  skillId: string,
  notes: string,
): StudiedMap {
  if (!map[skillId]) return map;
  return {
    ...map,
    [skillId]: {
      ...map[skillId],
      notes,
    },
  };
}

export function clearStudiedSkills(): StudiedMap {
  if (typeof window === "undefined") return {};
  try {
    window.localStorage.removeItem(STUDIED_SKILLS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return {};
}

export function confidenceLabel(c?: StudiedEntry["confidence"]): string {
  if (c === "shipped") return "Shipped";
  if (c === "applied") return "Applied";
  if (c === "studied") return "Studied";
  return "Studied";
}

export function confidenceTone(
  c?: StudiedEntry["confidence"],
): string {
  if (c === "shipped")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (c === "applied")
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export interface ProgressTier {
  key: "starter" | "rolling" | "scaling" | "complete";
  label: string;
  tone: string;
}

export function progressTierFor(pct: number): ProgressTier {
  if (pct >= 75)
    return {
      key: "complete",
      label: "complete (75%+)",
      tone:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  if (pct >= 50)
    return {
      key: "scaling",
      label: "scaling (50–74%)",
      tone:
        "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    };
  if (pct >= 25)
    return {
      key: "rolling",
      label: "rolling (25–49%)",
      tone:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  return {
    key: "starter",
    label: "starter (0–24%)",
    tone: "border-border bg-muted text-muted-foreground",
  };
}
