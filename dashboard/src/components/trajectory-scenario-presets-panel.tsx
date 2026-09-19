"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type ScenarioPreset,
  PRESETS_EVENT,
  PRESETS_MAX,
  PRESETS_STORAGE_KEY,
  applyPreset,
  countPresets,
  deletePreset,
  exportPresets,
  importPresets,
  loadPresets,
  renamePreset,
  savePreset,
} from "@/lib/trajectory-scenario-presets";

/**
 * `Trajectory scenario presets` — Move #128.aq on `/` (and `/today`).
 *
 * Renders the named-preset library alongside (or below) the comparator. Lets
 * the operator:
 *   - Save the current Scenario A or Scenario B as a named preset
 *     ("Aggressive — launch PDP A/B week 1")
 *   - Apply a saved preset back into the comparator with one click
 *   - Rename a preset inline (click the pencil → input → Enter to save)
 *   - Delete a preset (rose-accented ✕ chip, with `window.confirm()` to
 *     prevent accidental click-loss)
 *
 * Reads the comparator's existing localStorage state via the storage event +
 * the new `PRESETS_EVENT` same-tab event. Hydration-safe: returns
 * `Loading presets…` placeholder until the first effect runs.
 *
 * Compact prop = small chip row (used inside the compact comparator on
 * `/today`). Default = full panel with name input + save / apply / rename /
 * delete buttons.
 */

const STORAGE_KEY_A = "ecom-ops:trajectory-scenario:v1";
const STORAGE_KEY_B = "ecom-ops:trajectory-scenario-b:v1";
const SCENARIO_EVENT_A = "ecom-ops:trajectory-scenario:update";
const SCENARIO_EVENT_B = "ecom-ops:trajectory-scenario-b:update";

interface ScenarioStorageA {
  schema: "ecom-ops-trajectory-scenario";
  version: 1;
  state: { moveId: string | null; delayDays: number };
}

interface ScenarioStorageB {
  schema: "ecom-ops-trajectory-scenario-b";
  version: 1;
  enabled: boolean;
  state: { moveId: string | null; delayDays: number };
}

interface LiveScenarioA {
  moveId: string | null;
  delayDays: number;
}

interface LiveScenarioB {
  enabled: boolean;
  moveId: string | null;
  delayDays: number;
}

function readLiveScenarioA(): LiveScenarioA {
  if (typeof window === "undefined") return { moveId: null, delayDays: 30 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_A);
    if (!raw) return { moveId: null, delayDays: 30 };
    const parsed = JSON.parse(raw) as ScenarioStorageA;
    if (parsed?.schema !== "ecom-ops-trajectory-scenario") {
      return { moveId: null, delayDays: 30 };
    }
    return {
      moveId:
        typeof parsed.state?.moveId === "string" ? parsed.state.moveId : null,
      delayDays:
        typeof parsed.state?.delayDays === "number" && parsed.state.delayDays > 0
          ? parsed.state.delayDays
          : 30,
    };
  } catch {
    return { moveId: null, delayDays: 30 };
  }
}

function readLiveScenarioB(): LiveScenarioB {
  if (typeof window === "undefined") {
    return { enabled: false, moveId: null, delayDays: 60 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_B);
    if (!raw) return { enabled: false, moveId: null, delayDays: 60 };
    const parsed = JSON.parse(raw) as ScenarioStorageB;
    if (parsed?.schema !== "ecom-ops-trajectory-scenario-b") {
      return { enabled: false, moveId: null, delayDays: 60 };
    }
    return {
      enabled: parsed.enabled === true,
      moveId:
        typeof parsed.state?.moveId === "string" ? parsed.state.moveId : null,
      delayDays:
        typeof parsed.state?.delayDays === "number" && parsed.state.delayDays > 0
          ? parsed.state.delayDays
          : 60,
    };
  } catch {
    return { enabled: false, moveId: null, delayDays: 60 };
  }
}

/** Write a comparator-slot payload and notify the same-tab listeners. */
function writeScenario(slot: "A" | "B", moveId: string | null, delayDays: number) {
  if (typeof window === "undefined") return;
  try {
    if (slot === "A") {
      const payload: ScenarioStorageA = {
        schema: "ecom-ops-trajectory-scenario",
        version: 1,
        state: { moveId, delayDays },
      };
      window.localStorage.setItem(STORAGE_KEY_A, JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent(SCENARIO_EVENT_A, { detail: payload }),
      );
    } else {
      const payload: ScenarioStorageB = {
        schema: "ecom-ops-trajectory-scenario-b",
        version: 1,
        enabled: true,
        state: { moveId, delayDays },
      };
      window.localStorage.setItem(STORAGE_KEY_B, JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent(SCENARIO_EVENT_B, { detail: payload }),
      );
    }
  } catch {
    /* no-op */
  }
}

export interface TrajectoryScenarioPresetsPanelProps {
  /** Compact variant for the `/today` card. */
  compact?: boolean;
  /** Slot to scope the "Save current" button to ("A" by default). */
  defaultSlot?: "A" | "B";
  /** Optional className. */
  className?: string;
}

export function TrajectoryScenarioPresetsPanel({
  compact = false,
  defaultSlot = "A",
  className,
}: TrajectoryScenarioPresetsPanelProps) {
  const [hydrated, setHydrated] = useState(false);
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [slot, setSlot] = useState<"A" | "B">(defaultSlot);
  const [draftName, setDraftName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [liveA, setLiveA] = useState<LiveScenarioA>({
    moveId: null,
    delayDays: 30,
  });
  const [liveB, setLiveB] = useState<LiveScenarioB>({
    enabled: false,
    moveId: null,
    delayDays: 60,
  });

  // Hydrate from localStorage on mount + subscribe to storage + same-tab events.
  useEffect(() => {
    setPresets(loadPresets());
    setLiveA(readLiveScenarioA());
    setLiveB(readLiveScenarioB());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === PRESETS_STORAGE_KEY || e.key === null) {
        setPresets(loadPresets());
      }
      if (e.key === STORAGE_KEY_A || e.key === null) {
        setLiveA(readLiveScenarioA());
      }
      if (e.key === STORAGE_KEY_B || e.key === null) {
        setLiveB(readLiveScenarioB());
      }
    };
    const onPresets = () => setPresets(loadPresets());
    const onScenarioA = () => setLiveA(readLiveScenarioA());
    const onScenarioB = () => setLiveB(readLiveScenarioB());
    window.addEventListener("storage", onStorage);
    window.addEventListener(PRESETS_EVENT, onPresets);
    window.addEventListener(SCENARIO_EVENT_A, onScenarioA);
    window.addEventListener(SCENARIO_EVENT_B, onScenarioB);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PRESETS_EVENT, onPresets);
      window.removeEventListener(SCENARIO_EVENT_A, onScenarioA);
      window.removeEventListener(SCENARIO_EVENT_B, onScenarioB);
    };
  }, []);

  const live = slot === "A" ? liveA : liveB;
  const totalPresets = useMemo(() => presets.length, [presets]);

  const handleSave = () => {
    const result = savePreset({
      name: draftName,
      slot,
      moveId: live.moveId,
      delayDays: live.delayDays,
    });
    if (!result) {
      const reason =
        countPresets("any") >= PRESETS_MAX
          ? `Cap of ${PRESETS_MAX} presets reached`
          : "Enter a name + make sure the comparator has a move + delay set";
      setStatus(reason);
      return;
    }
    setDraftName("");
    setStatus(
      result.replaced
        ? `Updated preset "${result.preset.name}" (slot ${result.preset.slot})`
        : `Saved preset "${result.preset.name}" (slot ${result.preset.slot})`,
    );
  };

  const handleApply = (id: string) => {
    const result = applyPreset({ id });
    if (!result) {
      setStatus("Preset not found (was it deleted in another tab?)");
      return;
    }
    writeScenario(result.slot, result.moveId, result.delayDays);
    const preset = presets.find((p) => p.id === id);
    setStatus(
      `Applied "${preset?.name ?? id}" to slot ${result.slot} (${result.delayDays}d delay)`,
    );
  };

  const handleDelete = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    const ok =
      typeof window === "undefined" || window.confirm(`Delete preset "${preset.name}"?`);
    if (!ok) return;
    const removed = deletePreset(id);
    setStatus(
      removed
        ? `Deleted preset "${preset.name}"`
        : `Could not delete preset "${preset.name}"`,
    );
  };

  const startRename = (preset: ScenarioPreset) => {
    setRenamingId(preset.id);
    setRenameDraft(preset.name);
  };

  const commitRename = (id: string) => {
    const result = renamePreset({ id, name: renameDraft });
    if (!result) {
      setStatus(
        "Rename failed (empty name, or another preset already uses that name in this slot)",
      );
      setRenamingId(null);
      return;
    }
    setStatus(`Renamed to "${result.name}"`);
    setRenamingId(null);
  };

  // ----- Move #128.ar — Import / Export (JSON preset bundle) -----
  const importFileRef = useRef<HTMLInputElement>(null);
  const handleExportClick = () => {
    const payload = exportPresets("any");
    if (typeof window === "undefined" || payload.count === 0) {
      setStatus("Nothing to export — no presets saved yet");
      return;
    }
    try {
      const blob = new Blob([payload.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payload.filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`Exported ${payload.count} preset${payload.count === 1 ? "" : "s"} → ${payload.filename}`);
    } catch (err) {
      setStatus(`Export failed: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  };

  const handleImportClick = () => {
    if (!importFileRef.current) return;
    importFileRef.current.value = ""; // allow re-picking the same file
    importFileRef.current.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const result = importPresets({ json: text });
        if (!result.ok && result.added === 0) {
          setStatus(`Import failed — ${result.status}`);
          return;
        }
        setStatus(result.status);
      } catch (err) {
        setStatus(`Import failed: ${err instanceof Error ? err.message : "unknown error"}`);
      }
    };
    reader.onerror = () => {
      setStatus(`Could not read file "${file.name}" — file reader error`);
    };
    reader.readAsText(file);
  };

  if (!hydrated) {
    return (
      <div
        data-testid="trajectory-scenario-presets-placeholder"
        className={cn(
          "rounded border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
      >
        Loading presets…
      </div>
    );
  }

  return (
    <div
      data-testid="trajectory-scenario-presets-panel"
      className={cn(
        "rounded border border-border/60 bg-muted/20 px-3 py-2",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Presets
        </span>
        <span
          data-testid="trajectory-scenario-presets-count"
          className="text-[10px] text-muted-foreground"
        >
          {totalPresets}/{PRESETS_MAX} · slot {slot}
        </span>
        {!compact && (
          <span className="ml-auto inline-flex gap-1">
            <button
              type="button"
              data-testid="trajectory-scenario-presets-slot-a"
              onClick={() => setSlot("A")}
              aria-pressed={slot === "A"}
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                slot === "A"
                  ? "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40",
              )}
            >
              Slot A
            </button>
            <button
              type="button"
              data-testid="trajectory-scenario-presets-slot-b"
              onClick={() => setSlot("B")}
              aria-pressed={slot === "B"}
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                slot === "B"
                  ? "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/40",
              )}
            >
              Slot B
            </button>
          </span>
        )}
      </div>

      {/* === IMPORT / EXPORT ROW (Move #128.ar) === */}
      <div
        data-testid="trajectory-scenario-presets-import-export-row"
        className="mb-2 flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          onClick={handleExportClick}
          data-testid="trajectory-scenario-presets-export"
          aria-label="Export all presets as a JSON file"
          title="Download all presets as a JSON file you can share with a teammate"
          className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        >
          ↓ Export
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          data-testid="trajectory-scenario-presets-import"
          aria-label="Import presets from a JSON file"
          title="Upload a JSON file to add presets (skips ids you already have)"
          className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        >
          ↑ Import
        </button>
        <input
          ref={importFileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          data-testid="trajectory-scenario-presets-import-file"
          className="hidden"
        />
        <span
          data-testid="trajectory-scenario-presets-import-hint"
          className="text-[10px] text-muted-foreground"
        >
          Share presets with a teammate via a JSON file.
        </span>
      </div>

      {/* === SAVE ROW === */}
      <div
        data-testid="trajectory-scenario-presets-save-row"
        className="mb-2 flex flex-wrap items-center gap-2"
      >
        <input
          type="text"
          value={draftName}
          maxLength={40}
          placeholder={`Name the current slot ${slot} (e.g. "Aggressive Q1")`}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draftName.trim()) {
              e.preventDefault();
              handleSave();
            }
          }}
          data-testid="trajectory-scenario-presets-name-input"
          className={cn(
            "min-w-[160px] flex-1 rounded border border-border bg-background px-2 py-1",
            "focus:border-violet-500/60 focus:outline-none",
            compact ? "text-[10px]" : "text-xs",
          )}
        />
        <button
          type="button"
          onClick={handleSave}
          data-testid="trajectory-scenario-presets-save"
          disabled={!draftName.trim()}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono uppercase tracking-wider transition-colors",
            "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
            "disabled:border-border disabled:bg-background disabled:text-muted-foreground disabled:cursor-not-allowed",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          <span aria-hidden>＋</span>
          <span>Save</span>
        </button>
      </div>

      {/* === PRESET GRID === */}
      {totalPresets === 0 ? (
        <p
          data-testid="trajectory-scenario-presets-empty"
          className="text-[10px] italic text-muted-foreground"
        >
          No presets yet — pick a move + delay on the comparator above, name
          it, and hit Save.
        </p>
      ) : (
        <ul
          data-testid="trajectory-scenario-presets-list"
          className="flex flex-wrap gap-1.5"
        >
          {presets.map((preset) => {
            const isRenaming = renamingId === preset.id;
            return (
              <li
                key={preset.id}
                data-testid={`trajectory-scenario-preset-chip-${preset.slot}-${preset.id}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1",
                  preset.slot === "A"
                    ? "border-violet-500/40 bg-violet-500/5"
                    : "border-sky-500/40 bg-sky-500/5",
                )}
              >
                <span
                  className={cn(
                    "rounded-sm px-1 font-mono text-[9px] uppercase tracking-wider",
                    preset.slot === "A"
                      ? "bg-violet-500/20 text-violet-700 dark:text-violet-300"
                      : "bg-sky-500/20 text-sky-700 dark:text-sky-300",
                  )}
                >
                  {preset.slot}
                </span>
                {isRenaming ? (
                  <>
                    <input
                      type="text"
                      autoFocus
                      maxLength={40}
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename(preset.id);
                        } else if (e.key === "Escape") {
                          setRenamingId(null);
                        }
                      }}
                      data-testid="trajectory-scenario-presets-rename-input"
                      className="w-32 rounded border border-border bg-background px-1 py-0.5 text-[10px] focus:border-violet-500/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => commitRename(preset.id)}
                      data-testid="trajectory-scenario-presets-rename-save"
                      className="rounded border border-emerald-500/60 bg-emerald-500/10 px-1 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-500/20"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      data-testid="trajectory-scenario-presets-rename-cancel"
                      className="rounded border border-border bg-background px-1 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/40"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      data-testid={`trajectory-scenario-preset-name-${preset.id}`}
                      className="max-w-[160px] truncate font-medium text-foreground"
                      title={`${preset.name} · ${preset.moveId ?? "first eligible"} · +${preset.delayDays}d`}
                    >
                      {preset.name}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      +{preset.delayDays}d
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApply(preset.id)}
                      data-testid={`trajectory-scenario-preset-apply-${preset.id}`}
                      aria-label={`Apply preset ${preset.name}`}
                      title="Apply this preset to the comparator"
                      className="rounded border border-border bg-background px-1 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => startRename(preset)}
                      data-testid={`trajectory-scenario-preset-rename-${preset.id}`}
                      aria-label={`Rename preset ${preset.name}`}
                      title="Rename this preset"
                      className="rounded border border-border bg-background px-1 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(preset.id)}
                      data-testid={`trajectory-scenario-preset-delete-${preset.id}`}
                      aria-label={`Delete preset ${preset.name}`}
                      title="Delete this preset"
                      className="rounded border border-rose-500/40 bg-rose-500/5 px-1 py-0.5 text-[10px] text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                    >
                      ✕
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* === STATUS LINE === */}
      {status && (
        <p
          data-testid="trajectory-scenario-presets-status"
          className="mt-2 text-[10px] italic text-muted-foreground"
        >
          {status}
        </p>
      )}
    </div>
  );
}
