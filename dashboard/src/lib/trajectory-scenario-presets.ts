/**
 * `Trajectory scenario presets` — Move #128.aq on `/` (and `/today`).
 *
 * Closes the operator's "I tweak Scenario A, lose the previous tweak, tweak
 * again, lose again" loop. The comparator writes scenario state to
 * `ecom-ops:trajectory-scenario:v1` (A) and `ecom-ops:trajectory-scenario-b:v1`
 * (B), but until now there was no way to keep MORE THAN ONE saved scenario
 * around — overwriting the key wiped the previous state. This module adds a
 * named-preset library that stores N presets in `ecom-ops:trajectory-scenario-presets:v1`,
 * each with `{ id, name, moveId, delayDays, createdAt, updatedAt }`.
 *
 * Pure-logic module — no React, no DOM (except the typed `window` guard for
 * SSR safety). Helpers: `loadPresets`, `savePreset`, `applyPreset`, `deletePreset`,
 * `renamePreset`, plus schema constants and a same-tab CustomEvent name so the
 * comparator and the panel can stay in sync via the canonical event pattern.
 *
 * Layout is intentionally tiny (a single JSON-encoded array). The cap is 12
 * presets — beyond that, the operator is doing portfolio work, not scenario
 * what-if. Mirrors the canonical CSV-escape + schema constants pattern from
 * `trajectory-scenario-export.ts` so a future reader who learns one scenario
 * module learns all four.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PRESETS_STORAGE_KEY = "ecom-ops:trajectory-scenario-presets:v1";
export const PRESETS_EVENT = "ecom-ops:trajectory-scenario-presets:update";
export const PRESETS_SCHEMA = "ecom-ops-trajectory-scenario-presets";
export const PRESETS_VERSION = 1;

/** Hard cap on saved presets — beyond this, the helper refuses with `false`. */
export const PRESETS_MAX = 12;

export interface ScenarioPreset {
  /** Stable id (slug-style, generated from name + timestamp). */
  id: string;
  /** Operator-supplied display name (1..40 chars). */
  name: string;
  /** Paired scenario slot — "A" is the always-on slot; "B" is the optional 2nd. */
  slot: "A" | "B";
  /** Move id (e.g. "01-abandoned-cart-flow-klaviyo"). null = baseline picker. */
  moveId: string | null;
  /** Delay in days applied on top of `daysToShip`. Always >= 0. */
  delayDays: number;
  /** ISO date string (YYYY-MM-DD) when the preset was first created. */
  createdAt: string;
  /** ISO date string (YYYY-MM-DD) of the latest rename / re-save. */
  updatedAt: string;
}

export interface PresetsStorage {
  schema: typeof PRESETS_SCHEMA;
  version: typeof PRESETS_VERSION;
  presets: ScenarioPreset[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a display name: trim, collapse internal whitespace, cap to 40 chars,
 * and reject empty. Returns `null` when the name would be empty after trim.
 */
export function normalizePresetName(input: string): string | null {
  const trimmed = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, 40);
}

/** Generate a stable id from the operator-supplied name + the current date. */
export function presetId(name: string, today: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "preset";
  return `${slug}-${today.replace(/-/g, "")}`;
}

/** Today as `YYYY-MM-DD` — caller can override for deterministic tests. */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Load the presets array from `localStorage`. Returns `[]` when the key is
 * absent, the schema doesn't match, the JSON is malformed, or we're on the
 * server. Always returns a fresh array — callers may mutate it freely.
 */
export function loadPresets(): ScenarioPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PresetsStorage;
    if (parsed?.schema !== PRESETS_SCHEMA || !Array.isArray(parsed.presets)) {
      return [];
    }
    return parsed.presets.filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        (p.slot === "A" || p.slot === "B") &&
        typeof p.delayDays === "number",
    );
  } catch {
    return [];
  }
}

/** Persist the array back to `localStorage` (silent on quota / private mode). */
function persistPresets(presets: ScenarioPreset[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PresetsStorage = {
      schema: PRESETS_SCHEMA,
      version: PRESETS_VERSION,
      presets,
    };
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* no-op */
  }
}

/** Same-tab notification so the panel + comparator re-hydrate instantly. */
function notifyPresetsChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(PRESETS_EVENT));
  } catch {
    /* no-op */
  }
}

export interface SavePresetArgs {
  /** Display name (will be normalized). */
  name: string;
  /** Slot ("A" or "B") the preset targets. */
  slot: "A" | "B";
  /** Move id (null = pick-the-first-eligible default). */
  moveId: string | null;
  /** Delay days applied on top of `daysToShip`. */
  delayDays: number;
  /** Optional override for the timestamp — useful for deterministic tests. */
  now?: Date;
}

export interface SavePresetResult {
  /** The persisted preset. */
  preset: ScenarioPreset;
  /** True when an existing preset with the same name was overwritten. */
  replaced: boolean;
}

/**
 * Save (or overwrite) a preset. If a preset with the same `name` already
 * exists in the target `slot`, it's replaced in-place and `replaced: true` is
 * returned. Otherwise a new entry is appended. Refuses with `null` when:
 *   - name normalizes to empty,
 *   - delayDays is negative or NaN,
 *   - the cap (PRESETS_MAX) would be exceeded.
 */
export function savePreset(args: SavePresetArgs): SavePresetResult | null {
  const name = normalizePresetName(args.name);
  if (!name) return null;
  if (
    typeof args.delayDays !== "number" ||
    !Number.isFinite(args.delayDays) ||
    args.delayDays < 0
  ) {
    return null;
  }
  const today = todayIso(args.now);
  const list = loadPresets();
  const existing = list.findIndex(
    (p) => p.slot === args.slot && p.name.toLowerCase() === name.toLowerCase(),
  );
  let replaced = false;
  let preset: ScenarioPreset;
  if (existing >= 0) {
    preset = {
      ...list[existing],
      moveId: args.moveId,
      delayDays: args.delayDays,
      updatedAt: today,
    };
    list[existing] = preset;
    replaced = true;
  } else {
    if (list.length >= PRESETS_MAX) return null;
    preset = {
      id: presetId(name, today),
      name,
      slot: args.slot,
      moveId: args.moveId,
      delayDays: args.delayDays,
      createdAt: today,
      updatedAt: today,
    };
    list.push(preset);
  }
  persistPresets(list);
  notifyPresetsChanged();
  return { preset, replaced };
}

export interface ApplyPresetArgs {
  /** Id of the preset to apply. */
  id: string;
}

export interface ApplyPresetResult {
  /** Slot the preset overwrites. */
  slot: "A" | "B";
  /** Move id the comparator should select. */
  moveId: string | null;
  /** Delay days the comparator should select. */
  delayDays: number;
}

/**
 * Returns the move + delay a preset encodes so the caller can write the right
 * `ecom-ops:trajectory-scenario:v1` (A) or `ecom-ops:trajectory-scenario-b:v1`
 * (B) payload. The caller is responsible for the actual storage write +
 * same-tab CustomEvent — this helper only resolves the preset.
 */
export function applyPreset(args: ApplyPresetArgs): ApplyPresetResult | null {
  const list = loadPresets();
  const found = list.find((p) => p.id === args.id);
  if (!found) return null;
  return {
    slot: found.slot,
    moveId: found.moveId,
    delayDays: found.delayDays,
  };
}

/** Remove a preset by id. Returns true when something was removed. */
export function deletePreset(id: string): boolean {
  const list = loadPresets();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  persistPresets(next);
  notifyPresetsChanged();
  return true;
}

export interface RenamePresetArgs {
  id: string;
  /** New display name. */
  name: string;
  /** Optional timestamp override. */
  now?: Date;
}

/**
 * Rename a preset by id. Refuses when the new name normalizes to empty OR
 * another preset in the same slot already uses the new name (case-insensitive).
 * Returns the updated preset, or `null` when the rename couldn't be applied.
 */
export function renamePreset(args: RenamePresetArgs): ScenarioPreset | null {
  const name = normalizePresetName(args.name);
  if (!name) return null;
  const list = loadPresets();
  const idx = list.findIndex((p) => p.id === args.id);
  if (idx < 0) return null;
  const collision = list.find(
    (p) =>
      p.id !== args.id &&
      p.slot === list[idx].slot &&
      p.name.toLowerCase() === name.toLowerCase(),
  );
  if (collision) return null;
  const updated: ScenarioPreset = {
    ...list[idx],
    name,
    updatedAt: todayIso(args.now),
  };
  list[idx] = updated;
  persistPresets(list);
  notifyPresetsChanged();
  return updated;
}

/** Count presets in a given slot — useful for header badges. */
export function countPresets(slot: "A" | "B" | "any" = "any"): number {
  const list = loadPresets();
  if (slot === "any") return list.length;
  return list.filter((p) => p.slot === slot).length;
}

/** Suggested file-system-safe filename for a single-preset export. */
export function presetFilename(preset: ScenarioPreset): string {
  const slug = preset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "preset";
  return `ecom-ops-trajectory-preset-${preset.slot}-${slug}-${preset.updatedAt}.json`;
}
