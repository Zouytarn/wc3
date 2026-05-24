"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { BuildOrder, BuildStep, BuildStepType, BuildStyle } from "@/data/build-orders";
import { STEP_TYPE_CONFIG } from "@/data/build-orders";
import { suggestIconKeys, getBuildStepIcon, iconKeyToLabel, iconKeyToStepType } from "@/data/icons";
import type { Race } from "@/data/units";
import BuildOrderTimeline from "@/components/BuildOrderTimeline";
import {
  loadCustomBuilds,
  saveCustomBuild,
  deleteCustomBuild,
  exportAsJSON,
  importFromJSON,
  generateBuildId,
} from "@/lib/custom-builds";

// ── Constants ─────────────────────────────────────────────────────────────

const RACES: Race[] = ["human", "orc", "nightelf", "undead"];
const RACE_LABELS: Record<Race, string> = {
  human: "Human",
  orc: "Orc",
  nightelf: "Night Elf",
  undead: "Undead",
};
const STYLES: BuildStyle[] = ["aggressive", "defensive", "economic", "standard"];
const STEP_TYPES: BuildStepType[] = ["worker", "building", "tech", "unit", "hero", "research", "expand", "army"];

function emptyBuild(): BuildOrder {
  return {
    id: generateBuildId(),
    myRace: "orc",
    enemyRace: "human",
    name: "My Build Order",
    style: "standard",
    strategy: "",
    difficulty: "beginner",
    heroOrder: [],
    heroFirst: "",
    keyStrengths: [],
    keyWeaknesses: [],
    steps: [],
    lateGame: "",
    generalTips: [],
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
}

function emptyStep(): BuildStep {
  return { supply: "5/10", type: "worker", action: "", priority: "normal" };
}

// ── Sub-components ────────────────────────────────────────────────────────

function RacePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Race;
  onChange: (r: Race) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-white/40 uppercase tracking-wider">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {RACES.map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
              value === r
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70"
            )}
          >
            {RACE_LABELS[r]}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Returns true when the action text looks like a search/incomplete word
 * rather than a full action description. Used to decide whether clicking
 * an icon should auto-replace the action text with the canonical label.
 */
function looksLikeSearchQuery(action: string): boolean {
  const stripped = action.trim();
  // Short, no structural markers → treat as search query
  return stripped.length <= 28 && !/[→+×]/i.test(stripped);
}

function IconSuggestions({
  action,
  selected,
  myRace,
  onSelect,
}: {
  action: string;
  selected: string | undefined;
  myRace?: string;
  onSelect: (key: string | undefined, canonicalLabel: string | null) => void;
}) {
  const suggestions = suggestIconKeys(action, myRace);
  if (suggestions.length === 0 && !selected) return null;

  const selectedPath = selected ? getBuildStepIcon(selected) : undefined;
  const selectedLabel = selected ? iconKeyToLabel(selected) : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-white/30 uppercase tracking-wider">Icon</label>
        {selected && (
          <span className="text-[10px] text-white/40">{selectedLabel}</span>
        )}
        {selected && (
          <button
            onClick={() => onSelect(undefined, null)}
            className="text-[10px] text-white/25 hover:text-red-400 transition-colors ml-auto"
          >
            clear
          </button>
        )}
      </div>

      {/* Currently selected icon (large preview) */}
      {selectedPath && (
        <div className="flex items-center gap-2 pb-1">
          <img src={selectedPath} alt={selected} className="w-10 h-10 object-cover rounded-lg border border-amber-500/40" />
          <span className="text-xs text-amber-300/70 font-medium">Selected</span>
        </div>
      )}

      {/* Suggestions grid */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(({ key, path }) => {
            const label = iconKeyToLabel(key);
            return (
              <button
                key={key}
                onClick={() => {
                  if (selected === key) {
                    onSelect(undefined, null);
                  } else {
                    // Pass canonical label so action text can be auto-corrected
                    onSelect(key, looksLikeSearchQuery(action) ? label : null);
                  }
                }}
                title={label}
                className={cn(
                  "group relative rounded-lg border p-0.5 transition-all",
                  selected === key
                    ? "border-amber-500/60 bg-amber-500/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]"
                )}
              >
                <img src={path} alt={label} className="w-9 h-9 object-cover rounded-md" />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 px-1 rounded z-10">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {suggestions.length === 0 && !selected && action.length > 2 && (
        <p className="text-[10px] text-white/20 italic">No icons matched — try more specific words</p>
      )}
    </div>
  );
}

function StepRow({
  step,
  index,
  total,
  myRace,
  onUpdate,
  onDelete,
  onMove,
  onEnter,
}: {
  step: BuildStep;
  index: number;
  total: number;
  myRace: string;
  onUpdate: (s: BuildStep) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onEnter: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STEP_TYPE_CONFIG[step.type];
  const iconPath = step.iconKey ? getBuildStepIcon(step.iconKey) : undefined;

  return (
    <div className={cn("rounded-xl border transition-all", cfg.borderColor, cfg.bgColor)}>
      {/* Compact row */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Icon preview in compact row */}
        {iconPath ? (
          <img src={iconPath} alt={step.iconKey} className="w-6 h-6 rounded flex-shrink-0" />
        ) : (
          <span className="text-[10px] font-mono text-white/30 w-9 flex-shrink-0">{step.supply}</span>
        )}
        {iconPath && (
          <span className="text-[10px] font-mono text-white/25 flex-shrink-0">{step.supply}</span>
        )}
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0", cfg.textColor, cfg.bgColor)}>
          {step.type}
        </span>
        <span className="text-xs text-white/70 flex-1 truncate min-w-0">
          {step.action || <span className="text-white/25 italic">no action text</span>}
        </span>
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded flex-shrink-0",
          step.priority === "critical" ? "bg-red-500/20 text-red-400" :
          step.priority === "optional" ? "bg-white/[0.06] text-white/30" : "bg-white/[0.08] text-white/50"
        )}>
          {step.priority}
        </span>
        {/* Move / delete */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="text-white/20 hover:text-white/60 disabled:opacity-20 text-xs px-1" title="Move up">▲</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="text-white/20 hover:text-white/60 disabled:opacity-20 text-xs px-1" title="Move down">▼</button>
          <button onClick={onDelete}
            className="text-red-400/40 hover:text-red-400 text-xs px-1" title="Delete step">✕</button>
        </div>
        <span className="text-white/20 text-[10px] flex-shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-white/[0.06] pt-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Supply (X/Y)</label>
              <input
                className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-amber-500/50"
                value={step.supply}
                onChange={(e) => onUpdate({ ...step, supply: e.target.value })}
                placeholder="6/10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Type</label>
              <select
                className="w-full bg-[#0f0f1a] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                value={step.type}
                onChange={(e) => onUpdate({ ...step, type: e.target.value as BuildStepType })}
              >
                {STEP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Action field — drives icon suggestions; Enter creates next step */}
          <div className="space-y-1">
            <label className="text-[10px] text-white/30 uppercase tracking-wider">
              Action <span className="text-white/20 normal-case">— press Enter to add next step</span>
            </label>
            <input
              className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
              value={step.action}
              onChange={(e) => onUpdate({ ...step, action: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && step.action.trim()) {
                  e.preventDefault();
                  onEnter();
                }
              }}
              placeholder="e.g. Build Farm × 2 + Barracks"
              autoFocus={index > 0}
            />
          </div>

          {/* Smart icon picker — auto-matches action text, race-filtered, auto-sets type */}
          <IconSuggestions
            action={step.action}
            selected={step.iconKey}
            myRace={myRace}
            onSelect={(key, canonicalLabel) => {
              const newAction = canonicalLabel ?? step.action;
              const newType = key ? (iconKeyToStepType(key) as BuildStep["type"]) : step.type;
              onUpdate({ ...step, iconKey: key, action: newAction, type: newType });
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Priority</label>
              <select
                className="w-full bg-[#0f0f1a] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                value={step.priority}
                onChange={(e) => onUpdate({ ...step, priority: e.target.value as BuildStep["priority"] })}
              >
                <option value="critical">Critical</option>
                <option value="normal">Normal</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Note (optional)</label>
              <input
                className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                value={step.note ?? ""}
                onChange={(e) => onUpdate({ ...step, note: e.target.value || undefined })}
                placeholder="Extra tip or context"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main editor ────────────────────────────────────────────────────────────

export default function BuilderEditor() {
  const [savedBuilds, setSavedBuilds] = useState<BuildOrder[]>([]);
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [build, setBuild] = useState<BuildOrder>(emptyBuild);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [importText, setImportText] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const all = loadCustomBuilds();
    setSavedBuilds(all);
  }, []);

  function setField<K extends keyof BuildOrder>(key: K, val: BuildOrder[K]) {
    setBuild((b) => ({ ...b, [key]: val }));
  }

  function addStep() {
    setBuild((b) => ({ ...b, steps: [...b.steps, emptyStep()] }));
  }

  function addStepAfter(index: number) {
    setBuild((b) => {
      const steps = [...b.steps];
      steps.splice(index + 1, 0, emptyStep());
      return { ...b, steps };
    });
  }

  /**
   * Parses freeform text into build steps.
   * Each non-empty line = 1 step.
   * Optional supply prefix: "10/20 Headhunter × 2" → supply="10/20", action="Headhunter × 2"
   */
  function parseTextImport() {
    const lines = importText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const newSteps: BuildStep[] = lines.map((line) => {
      // Try to extract supply notation at start: "10/20 ..." or "10/20: ..."
      const supplyMatch = line.match(/^(\d+\/\d+)[:\s]+(.+)$/);
      const supply = supplyMatch ? supplyMatch[1] : "5/10";
      const actionText = supplyMatch ? supplyMatch[2].trim() : line;

      // Find best icon match for this line
      const suggestions = suggestIconKeys(actionText, build.myRace);
      const best = suggestions[0];
      const iconKey = best?.key;
      const type = iconKey
        ? (iconKeyToStepType(iconKey) as BuildStep["type"])
        : "building";
      // If action text is a search fragment and we found an icon → use canonical label
      const action =
        iconKey && looksLikeSearchQuery(actionText)
          ? iconKeyToLabel(iconKey)
          : actionText;

      return { supply, type, action, priority: "normal" as const, iconKey };
    });

    setBuild((b) => ({ ...b, steps: [...b.steps, ...newSteps] }));
    setImportText("");
    setShowTextImport(false);
  }

  function updateStep(i: number, s: BuildStep) {
    setBuild((b) => {
      const steps = [...b.steps];
      steps[i] = s;
      return { ...b, steps };
    });
  }

  function deleteStep(i: number) {
    setBuild((b) => ({ ...b, steps: b.steps.filter((_, idx) => idx !== i) }));
  }

  function moveStep(i: number, dir: -1 | 1) {
    setBuild((b) => {
      const steps = [...b.steps];
      const j = i + dir;
      if (j < 0 || j >= steps.length) return b;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...b, steps };
    });
  }

  function handleSave() {
    const updated = { ...build, isCustom: true as const };
    saveCustomBuild(updated);
    setSavedBuilds(loadCustomBuilds());
    setActiveBuildId(updated.id);
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(null), 2000);
  }

  function handleDelete(id: string) {
    deleteCustomBuild(id);
    setSavedBuilds(loadCustomBuilds());
    if (activeBuildId === id) {
      const fresh = emptyBuild();
      setBuild(fresh);
      setActiveBuildId(null);
    }
  }

  function handleNew() {
    const fresh = emptyBuild();
    setBuild(fresh);
    setActiveBuildId(null);
  }

  function handleLoad(b: BuildOrder) {
    setBuild(b);
    setActiveBuildId(b.id);
  }

  function handleExport() {
    exportAsJSON(build);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromJSON(file);
      setBuild(imported);
      setActiveBuildId(null);
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#06060c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white">Build Order Builder</h1>
            <p className="text-xs text-white/40 mt-0.5">Create, save and share your own WC3 build orders</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="px-3 py-1.5 rounded-xl text-xs border bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80 transition-colors"
            >
              {showPreview ? "Hide" : "Show"} Preview
            </button>
              <button
                onClick={() => setShowTextImport((v) => !v)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs border transition-colors",
                  showTextImport
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80"
                )}
              >
                Paste Text
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-xl text-xs border bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80 transition-colors"
              >
                Export JSON
              </button>
            <button
              onClick={() => importRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs border bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80 transition-colors"
            >
              Import JSON
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all"
            >
              {saveMsg ?? "Save Build"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Saved builds sidebar ────────────────────────────── */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">My Builds</span>
                <button
                  onClick={handleNew}
                  className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  + New
                </button>
              </div>

              {savedBuilds.length === 0 && (
                <p className="text-xs text-white/25 py-2">No saved builds yet. Create one and click Save!</p>
              )}

              <div className="space-y-1">
                {savedBuilds.map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all group border",
                      activeBuildId === b.id
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                    )}
                    onClick={() => handleLoad(b)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{b.name}</p>
                      <p className="text-[10px] text-white/30">
                        {RACE_LABELS[b.myRace]} vs {RACE_LABELS[b.enemyRace]}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                      className="text-red-400/0 group-hover:text-red-400/40 hover:!text-red-400 text-xs transition-colors"
                      title="Delete build"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Editor + Preview ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Build metadata */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Build Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RacePicker label="Your Race" value={build.myRace} onChange={(r) => setField("myRace", r)} />
                <RacePicker label="Enemy Race" value={build.enemyRace} onChange={(r) => setField("enemyRace", r)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider">Build Name</label>
                  <input
                    className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
                    value={build.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. Fast Expand into Knights"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider">Style</label>
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setField("style", s)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                          build.style === s
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Strategy Description</label>
                <textarea
                  rows={2}
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 transition-colors resize-none"
                  value={build.strategy}
                  onChange={(e) => setField("strategy", e.target.value)}
                  placeholder="Describe the overall strategy..."
                />
              </div>
            </div>

            {/* Steps editor */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">
                  Build Steps ({build.steps.length})
                </p>
                <div className="flex items-center gap-2 text-[10px] text-white/25">
                  <span>Supply</span>
                  <span>·</span>
                  <span>Type</span>
                  <span>·</span>
                  <span>Action</span>
                  <span>·</span>
                  <span>Priority</span>
                </div>
              </div>

              <div className="space-y-2">
                {build.steps.map((step, i) => (
                  <StepRow
                    key={i}
                    step={step}
                    index={i}
                    total={build.steps.length}
                    myRace={build.myRace}
                    onUpdate={(s) => updateStep(i, s)}
                    onDelete={() => deleteStep(i)}
                    onMove={(dir) => moveStep(i, dir)}
                    onEnter={() => addStepAfter(i)}
                  />
                ))}
              </div>

              {/* Text import panel */}
              {showTextImport && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2">
                  <p className="text-[10px] text-amber-300/60">
                    Paste any build order text — one action per line.
                    Optionally prefix with supply: <span className="font-mono">10/20 Headhunter × 2</span>
                  </p>
                  <textarea
                    rows={6}
                    className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40 resize-none font-mono"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={"5/10 Train Peons\n7/10 Build Burrow + Barracks\n10/20 Far Seer\n12/20 Headhunter × 2\n14/20 Creep with wolves..."}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={parseTextImport}
                      disabled={!importText.trim()}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 transition-all"
                    >
                      Parse & Add Steps
                    </button>
                    <button
                      onClick={() => { setShowTextImport(false); setImportText(""); }}
                      className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={addStep}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.12] text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-all"
              >
                + Add Step
              </button>
            </div>

            {/* Preview */}
            {showPreview && build.steps.length > 0 && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Live Preview</p>
                <BuildOrderTimeline buildOrders={[{ ...build, isCustom: true }]} />
              </div>
            )}

            {showPreview && build.steps.length === 0 && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-sm text-white/25">Add steps above to see a live preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
