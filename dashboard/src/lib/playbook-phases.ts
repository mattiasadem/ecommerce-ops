/**
 * `Per-playbook phased progress` — operator-owned per-step checklist.
 *
 * Every playbook that has a `## Step-by-step` section is decomposed into
 * N phases at build time (see `scripts/parse-content.mjs` → `playbook.phases`).
 * The operator ticks each phase as they ship it. State persists in
 * localStorage so progress survives reloads and is per-browser.
 *
 * Storage key: `ecom-ops:playbook-phases:v1`
 *   Schema: `Record<playbookId, { phaseId: true }>` (only completed phases stored).
 *   Phases that aren't keys are unchecked. Missing playbook entries mean
 *   "no progress yet" (consistent with the binary shipped/unshipped tracker).
 *
 * Derived stats (computed per-call, not persisted):
 *   - `countCompletedPhases(map, playbookId)` — how many phases completed
 *   - `countTotalPhases(playbook)` — playbook.phases?.length || 0
 *   - `pctComplete(map, playbook)` — 0..100, NaN-guarded to 0
 *   - `totalProgressPct(mapsById, playbooks)` — fleet-wide rolled-up %
 *
 * Cross-tab sync: writers should dispatch a CustomEvent
 * `ecom-ops:playbook-phases:update` (React-side wiring lives in
 * `components/phased-progress.tsx`); listeners on other tabs/routes can
 * pick up the change without a page reload.
 *
 * No deps. Pure-logic helpers; the React component handles storage,
 * hydration, and the synthesis with the existing shipped-playbooks map.
 */

import type { Playbook } from "./content";

export const PLAYBOOK_PHASES_STORAGE_KEY = "ecom-ops:playbook-phases:v1";
export const PLAYBOOK_PHASES_UPDATE_EVENT = "ecom-ops:playbook-phases:update";
export const PLAYBOOK_PHASES_SCHEMA = "ecom-ops-playbook-phases";
export const PLAYBOOK_PHASES_VERSION = 1;

/** Per-playbook map of completed phase ids. */
export type PhaseMap = Record<string, Record<string, true>>;

export function loadPhasedProgress(): PhaseMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PLAYBOOK_PHASES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: PhaseMap = {};
    for (const [pbId, phaseMap] of Object.entries(parsed as PhaseMap)) {
      if (!phaseMap || typeof phaseMap !== "object") continue;
      const inner: Record<string, true> = {};
      for (const [pid, done] of Object.entries(phaseMap as Record<string, unknown>)) {
        if (done === true) inner[pid] = true;
      }
      if (Object.keys(inner).length) out[pbId] = inner;
    }
    return out;
  } catch {
    return {};
  }
}

export function savePhasedProgress(map: PhaseMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PLAYBOOK_PHASES_STORAGE_KEY,
      JSON.stringify(map),
    );
    window.dispatchEvent(
      new CustomEvent(PLAYBOOK_PHASES_UPDATE_EVENT, { detail: { map } }),
    );
  } catch {
    /* quota / private mode — silently skip */
  }
}

/** Toggle a single phase for a single playbook. Returns the new map. */
export function togglePhase(
  map: PhaseMap,
  playbookId: string,
  phaseId: string,
): PhaseMap {
  const prev = map[playbookId] ?? {};
  const next = { ...prev };
  if (next[phaseId]) {
    delete next[phaseId];
  } else {
    next[phaseId] = true;
  }
  const out = { ...map };
  if (Object.keys(next).length === 0) {
    delete out[playbookId];
  } else {
    out[playbookId] = next;
  }
  return out;
}

/** Mark every phase of a playbook complete in one call. */
export function markAllPhases(
  map: PhaseMap,
  playbookId: string,
  phases: ReadonlyArray<{ id: string }>,
): PhaseMap {
  const next: Record<string, true> = {};
  for (const p of phases) next[p.id] = true;
  const out = { ...map };
  if (Object.keys(next).length === 0) {
    delete out[playbookId];
  } else {
    out[playbookId] = next;
  }
  return out;
}

/** Clear a single playbook's phase progress. */
export function clearPlaybookPhases(map: PhaseMap, playbookId: string): PhaseMap {
  if (!(playbookId in map)) return map;
  const out = { ...map };
  delete out[playbookId];
  return out;
}

/** Reset every playbook's phase progress. */
export function clearAllPhasedProgress(): PhaseMap {
  return {};
}

// ---------- derived stats ----------

export function countCompletedPhases(map: PhaseMap, playbookId: string): number {
  return Object.keys(map[playbookId] ?? {}).length;
}

export function countTotalPhases(playbook: Playbook): number {
  return playbook.phases?.length ?? 0;
}

/** 0..100 percentage complete. NaN-guarded to 0 when no phases. */
export function pctComplete(map: PhaseMap, playbook: Playbook): number {
  const total = countTotalPhases(playbook);
  if (total === 0) return 0;
  const done = countCompletedPhases(map, playbook.file.replace(/\.md$/, ""));
  return Math.max(0, Math.min(100, (done / total) * 100));
}

/**
 * Fleet-wide phased progress: completion-weighted average across all
 * playbooks that have phases. Playbooks without a phases array are
 * excluded entirely (don't drag the average down to 0).
 */
export function totalProgressPct(map: PhaseMap, playbooks: ReadonlyArray<Playbook>): number {
  let totalPhases = 0;
  let totalDone = 0;
  for (const pb of playbooks) {
    const id = pb.file.replace(/\.md$/, "");
    const total = countTotalPhases(pb);
    if (total === 0) continue;
    const done = countCompletedPhases(map, id);
    totalPhases += total;
    totalDone += done;
  }
  if (totalPhases === 0) return 0;
  return Math.max(0, Math.min(100, (totalDone / totalPhases) * 100));
}

const INTENT_BANDS = [
  { min: 75, label: "shipping strong", tone: "complete" as const },
  { min: 50, label: "past halfway", tone: "scaling" as const },
  { min: 25, label: "rolling", tone: "rolling" as const },
  { min: 1, label: "started", tone: "starter" as const },
  { min: 0, label: "not started", tone: "none" as const },
];

export type ProgressIntent =
  | "complete"
  | "scaling"
  | "rolling"
  | "starter"
  | "none";

export interface ProgressIntentLabel {
  label: string;
  tone: ProgressIntent;
}

export function progressIntent(pct: number): ProgressIntentLabel {
  for (const band of INTENT_BANDS) {
    if (pct >= band.min) return { label: band.label, tone: band.tone };
  }
  return INTENT_BANDS[INTENT_BANDS.length - 1];
}

/**
 * Emit a paste-ready, single-section markdown report for the operator's
 * per-phase progress. Useful for handoff to a teammate.
 */
export function renderPhasedMarkdown(map: PhaseMap, playbooks: ReadonlyArray<Playbook>): string {
  const lines: string[] = [];
  const totalPct = totalProgressPct(map, playbooks);
  const playbooksWithPhases = playbooks.filter(
    (p) => (p.phases?.length ?? 0) > 0,
  );
  lines.push(`# Per-playbook phased progress`);
  lines.push("");
  lines.push(`Fleet-wide: **${totalPct.toFixed(1)}%** complete across ${playbooksWithPhases.length} phased playbooks.`);
  lines.push("");
  for (const pb of playbooksWithPhases) {
    const id = pb.file.replace(/\.md$/, "");
    const done = countCompletedPhases(map, id);
    const total = countTotalPhases(pb);
    const pct = total ? (done / total) * 100 : 0;
    lines.push(`## ${pb.title}`);
    lines.push("");
    lines.push(`**${done} / ${total} phases · ${pct.toFixed(0)}%**`);
    if (pb.phases && pb.phases.length) {
      for (const ph of pb.phases) {
        const mark = map[id]?.[ph.id] ? "[x]" : "[ ]";
        lines.push(`- ${mark} Step ${ph.order}: ${ph.heading}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}
