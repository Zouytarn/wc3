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
import {
  supabase,
  signOut,
  getCloudBuilds,
  upsertCloudBuild,
  deleteCloudBuild,
} from "@/lib/supabase";
import AuthModal from "@/components/builder/AuthModal";
import type { Session } from "@supabase/supabase-js";

// ── Constants ─────────────────────────────────────────────────────────────

const RACES: Race[] = ["human", "orc", "nightelf", "undead"];
const ENEMY_RACES: (Race | "general")[] = ["human", "orc", "nightelf", "undead", "general"];
const RACE_LABELS: Record<Race | "general", string> = {
  human: "Human",
  orc: "Orc",
  nightelf: "Night Elf",
  undead: "Undead",
  general: "General",
};
const STYLES: BuildStyle[] = ["aggressive", "defensive", "economic", "standard"];

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
  return { supply: "5/10", type: "unit", action: "", priority: "normal" };
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns true when action text looks like a short search fragment —
 * clicking an icon should then replace the action with the canonical label.
 */
function looksLikeSearchQuery(action: string): boolean {
  return action.trim().length <= 28 && !/[→+×]/i.test(action);
}

// ── Icon suggestions ──────────────────────────────────────────────────────

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
        <span className="text-[10px] text-white/25 uppercase tracking-wider">Icon</span>
        {selected && <span className="text-[10px] text-white/40">{selectedLabel}</span>}
        {selected && (
          <button
            onClick={() => onSelect(undefined, null)}
            className="ml-auto text-[10px] text-white/20 hover:text-red-400 transition-colors"
          >
            clear
          </button>
        )}
      </div>

      {selectedPath && (
        <div className="flex items-center gap-2">
          <img src={selectedPath} alt={selected} className="w-9 h-9 object-cover rounded-lg border border-amber-500/40" />
          <span className="text-[10px] text-amber-300/60">Selected</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {suggestions.map(({ key, path }) => {
            const label = iconKeyToLabel(key);
            return (
              <button
                key={key}
                onClick={() => {
                  if (selected === key) {
                    onSelect(undefined, null);
                  } else {
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
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 px-1 py-0.5 rounded z-10">
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

// ── StepRow (controlled expansion) ────────────────────────────────────────

function StepRow({
  step,
  index,
  total,
  expanded,
  myRace,
  onToggle,
  onUpdate,
  onDelete,
  onMove,
  onEnter,
}: {
  step: BuildStep;
  index: number;
  total: number;
  expanded: boolean;
  myRace: string;
  onToggle: () => void;
  onUpdate: (s: BuildStep) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onEnter: () => void;
}) {
  const cfg = STEP_TYPE_CONFIG[step.type];
  const iconPath = step.iconKey ? getBuildStepIcon(step.iconKey) : undefined;
  const actionRef = useRef<HTMLInputElement>(null);

  // Auto-focus action input when this step opens
  useEffect(() => {
    if (expanded) {
      // Small delay so the DOM expands before focus
      const t = setTimeout(() => actionRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  return (
    <div className={cn("rounded-xl border transition-all", cfg.borderColor, cfg.bgColor)}>

      {/* ── Compact row: supply · dot · icon · action ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={onToggle}
      >
        {/* Supply — always leftmost */}
        <span className="font-mono text-[10px] text-white/30 w-10 flex-shrink-0 tabular-nums">
          {step.supply}
        </span>

        {/* Type dot */}
        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dotColor)} />

        {/* Icon(s) — show iconSteps if compound, else single iconKey */}
        {step.iconSteps ? (
          <div className="flex gap-0.5 flex-shrink-0">
            {step.iconSteps.slice(0, 3).map(({ key, label }) => {
              const p = getBuildStepIcon(key);
              return p ? (
                <img key={key} src={p} alt={label} title={label} className="w-6 h-6 rounded" />
              ) : null;
            })}
          </div>
        ) : iconPath ? (
          <img src={iconPath} alt={step.iconKey} className="w-6 h-6 rounded flex-shrink-0" />
        ) : null}

        {/* Action text */}
        <span className="flex-1 min-w-0 text-xs text-white/70 truncate">
          {step.action || <span className="text-white/25 italic">empty step</span>}
        </span>

        {/* Controls */}
        <div
          className="flex items-center gap-0.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="text-white/20 hover:text-white/60 disabled:opacity-20 px-1 text-xs"
            title="Move up"
          >▲</button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="text-white/20 hover:text-white/60 disabled:opacity-20 px-1 text-xs"
            title="Move down"
          >▼</button>
          <button
            onClick={onDelete}
            className="text-red-400/30 hover:text-red-400 px-1 text-xs"
            title="Delete"
          >✕</button>
        </div>

        <span className="text-white/20 text-[10px] flex-shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* ── Expanded form: minimal ── */}
      {expanded && (
        <div className="px-3 pb-3 pt-2.5 border-t border-white/[0.06] space-y-3">

          {/* Supply + Action on one row */}
          <div className="flex gap-2 items-center">
            <input
              className="w-20 flex-shrink-0 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-500/50"
              value={step.supply}
              onChange={(e) => onUpdate({ ...step, supply: e.target.value })}
              placeholder="6/10"
              title="Supply (used/cap)"
            />
            <input
              ref={actionRef}
              className="flex-1 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-amber-500/50"
              value={step.action}
              onChange={(e) => onUpdate({ ...step, action: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && step.action.trim()) {
                  e.preventDefault();
                  // Auto-apply best icon suggestion before moving to next step
                  const suggestions = suggestIconKeys(step.action, myRace);
                  const best = suggestions[0];
                  if (best && !step.iconKey && looksLikeSearchQuery(step.action)) {
                    const label = iconKeyToLabel(best.key);
                    const type = iconKeyToStepType(best.key) as BuildStepType;
                    onUpdate({ ...step, iconKey: best.key, action: label, type });
                  }
                  onEnter();
                }
              }}
              placeholder="What happens at this step… (Enter = next step)"
            />
          </div>

          {/* Smart icon picker */}
          <IconSuggestions
            action={step.action}
            selected={step.iconKey}
            myRace={myRace}
            onSelect={(key, canonicalLabel) => {
              const newAction = canonicalLabel ?? step.action;
              const newType = key ? (iconKeyToStepType(key) as BuildStepType) : step.type;
              onUpdate({ ...step, iconKey: key, action: newAction, type: newType });
            }}
          />

          {/* Note — subtle */}
          <input
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-[11px] text-white/50 outline-none focus:border-white/20 focus:text-white/70 transition-colors"
            value={step.note ?? ""}
            onChange={(e) => onUpdate({ ...step, note: e.target.value || undefined })}
            placeholder="Optional note or tip for this step…"
          />
        </div>
      )}
    </div>
  );
}

// ── RacePicker ────────────────────────────────────────────────────────────

function RacePicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Race | "general";
  options: (Race | "general")[];
  onChange: (r: Race | "general") => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-white/40 uppercase tracking-wider">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((r) => (
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

// ── Main editor ────────────────────────────────────────────────────────────

export default function BuilderEditor() {
  const [savedBuilds, setSavedBuilds] = useState<BuildOrder[]>([]);
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [build, setBuild] = useState<BuildOrder>(emptyBuild);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [importText, setImportText] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSaveAfterAuth, setPendingSaveAfterAuth] = useState(false);

  // On mount: load local builds + subscribe to auth changes
  useEffect(() => {
    setSavedBuilds(loadCustomBuilds());

    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session) loadCloudBuilds(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadCloudBuilds(s.user.id);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCloudBuilds(userId: string) {
    const cloud = await getCloudBuilds(userId);
    // Merge: cloud builds override any local version with same id
    const local = loadCustomBuilds();
    const merged = [...local];
    for (const cb of cloud) {
      if (!merged.find((b) => b.id === cb.id)) merged.push(cb);
    }
    setSavedBuilds(merged);
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setSavedBuilds(loadCustomBuilds());
  }

  /** Called by AuthModal when sign-in succeeds. */
  function handleAuthSuccess() {
    setShowAuthModal(false);
    if (pendingSaveAfterAuth) {
      setPendingSaveAfterAuth(false);
      // session will be set via onAuthStateChange — trigger save after brief delay
      setTimeout(() => handleSave(), 300);
    }
  }

  function setField<K extends keyof BuildOrder>(key: K, val: BuildOrder[K]) {
    setBuild((b) => ({ ...b, [key]: val }));
  }

  /** Add a blank step and open it for editing. */
  function addStep() {
    const newIdx = build.steps.length;
    setBuild((b) => ({ ...b, steps: [...b.steps, emptyStep()] }));
    setExpandedIdx(newIdx);
  }

  /** Insert a blank step after index i and open it. */
  function addStepAfter(i: number) {
    setBuild((b) => {
      const steps = [...b.steps];
      steps.splice(i + 1, 0, emptyStep());
      return { ...b, steps };
    });
    setExpandedIdx(i + 1);
  }

  /**
   * Update a step. If no iconKey is set and action has changed, auto-detect
   * the type from the best icon suggestion.
   */
  function updateStep(i: number, s: BuildStep) {
    let resolved = s;
    if (!s.iconKey && s.action) {
      const [best] = suggestIconKeys(s.action, build.myRace);
      if (best) resolved = { ...s, type: iconKeyToStepType(best.key) as BuildStepType };
    }
    setBuild((b) => {
      const steps = [...b.steps];
      steps[i] = resolved;
      return { ...b, steps };
    });
  }

  function deleteStep(i: number) {
    setBuild((b) => ({ ...b, steps: b.steps.filter((_, idx) => idx !== i) }));
    setExpandedIdx((prev) => {
      if (prev === null) return null;
      if (prev === i) return null;
      if (prev > i) return prev - 1;
      return prev;
    });
  }

  function moveStep(i: number, dir: -1 | 1) {
    setBuild((b) => {
      const steps = [...b.steps];
      const j = i + dir;
      if (j < 0 || j >= steps.length) return b;
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...b, steps };
    });
    setExpandedIdx((prev) => {
      if (prev === i) return i + dir;
      if (prev === i + dir) return i;
      return prev;
    });
  }

  /**
   * Given a step's action text, tries to detect one or multiple icons.
   * Splits on commas, em-dashes and "and" to find compound steps.
   * Returns iconKey (single) or iconSteps (multiple, deduplicated).
   */
  function detectIconsInText(text: string): {
    iconKey?: string;
    iconSteps?: Array<{ key: string; label: string }>;
  } {
    // Split into segments on natural separators
    const segments = text
      .split(/,|–|—|\band\b/i)
      .map((s) => s.trim().replace(/^\d+\s*/, "").trim())
      .filter((s) => s.length > 2);

    const found: Array<{ key: string; label: string }> = [];
    const usedKeys = new Set<string>();

    for (const seg of segments) {
      const suggestions = suggestIconKeys(seg, build.myRace);
      for (const s of suggestions) {
        if (!usedKeys.has(s.key)) {
          usedKeys.add(s.key);
          found.push({ key: s.key, label: iconKeyToLabel(s.key) });
          break;
        }
      }
    }

    if (found.length >= 2) return { iconSteps: found };
    if (found.length === 1) return { iconKey: found[0].key };
    return {};
  }

  /**
   * Parses freeform text into build steps — each line = 1 step.
   * Handles Grubby-style: "6/10 – 4 peon to gold, 1 peon to build Altar"
   * Supports em-dash, en-dash, and hyphen separators between supply and action.
   */
  function parseTextImport() {
    const lines = importText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const newSteps: BuildStep[] = lines.map((line) => {
      // Match supply with any dash variant (hyphen, en-dash, em-dash) as separator
      const supplyMatch = line.match(/^(\d+\/\d+)\s*[-–—:]\s*(.+)$/);
      const supply = supplyMatch ? supplyMatch[1] : "5/10";
      const actionText = supplyMatch ? supplyMatch[2].trim() : line;

      const { iconKey, iconSteps } = detectIconsInText(actionText);

      // Determine type from first icon found
      const primaryKey = iconKey ?? iconSteps?.[0]?.key;
      const type = primaryKey ? (iconKeyToStepType(primaryKey) as BuildStepType) : "unit";

      // Keep original action text (it's descriptive, not a bare search query)
      return {
        supply,
        type,
        action: actionText,
        priority: "normal" as const,
        ...(iconSteps ? { iconSteps } : iconKey ? { iconKey } : {}),
      };
    });

    setBuild((b) => ({ ...b, steps: [...b.steps, ...newSteps] }));
    setImportText("");
    setShowTextImport(false);
  }

  async function handleSave() {
    // If Supabase is configured but user isn't logged in, prompt them first
    if (supabase && !session) {
      setPendingSaveAfterAuth(true);
      setShowAuthModal(true);
      return;
    }

    const updated = { ...build, isCustom: true as const, authorId: session?.user.id };
    saveCustomBuild(updated);
    setSavedBuilds(loadCustomBuilds());
    setActiveBuildId(updated.id);

    if (session) {
      const ok = await upsertCloudBuild(updated);
      setSaveMsg(ok ? "Saved to cloud ☁" : "Saved locally (cloud error)");
    } else {
      setSaveMsg("Saved locally");
    }
    setTimeout(() => setSaveMsg(null), 2500);
  }

  async function handleDelete(id: string) {
    deleteCustomBuild(id);
    if (session) await deleteCloudBuild(id);
    setSavedBuilds(loadCustomBuilds());
    if (activeBuildId === id) {
      setBuild(emptyBuild());
      setActiveBuildId(null);
    }
  }

  function handleNew() {
    setBuild(emptyBuild());
    setActiveBuildId(null);
    setExpandedIdx(null);
  }

  function handleLoad(b: BuildOrder) {
    setBuild(b);
    setActiveBuildId(b.id);
    setExpandedIdx(null);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromJSON(file);
      setBuild(imported);
      setActiveBuildId(null);
      setExpandedIdx(null);
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
            {/* Auth button */}
            {supabase && (
              session ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400/70 border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-1 rounded-lg">
                    ☁ {session.user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-[10px] text-white/25 hover:text-white/60 transition-colors px-2 py-1"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setPendingSaveAfterAuth(false); setShowAuthModal(true); }}
                  className="px-3 py-1.5 rounded-xl text-xs border bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80 transition-colors"
                >
                  Sign in ☁
                </button>
              )
            )}
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
              onClick={() => exportAsJSON(build)}
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

          {/* ── Left: Saved builds sidebar ──────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">My Builds</span>
                <button onClick={handleNew} className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors">
                  + New
                </button>
              </div>

              {savedBuilds.length === 0 && (
                <p className="text-xs text-white/25 py-2">No saved builds yet.</p>
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
                    >✕</button>
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
                <RacePicker
                  label="Your Race"
                  value={build.myRace}
                  options={RACES}
                  onChange={(r) => setField("myRace", r as Race)}
                />
                <RacePicker
                  label="Enemy Race"
                  value={build.enemyRace}
                  options={ENEMY_RACES}
                  onChange={(r) => setField("enemyRace", r)}
                />
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
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Strategy</label>
                <textarea
                  rows={2}
                  className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 transition-colors resize-none"
                  value={build.strategy}
                  onChange={(e) => setField("strategy", e.target.value)}
                  placeholder="Describe the overall plan…"
                />
              </div>
            </div>

            {/* Steps editor */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">
                  Build Steps ({build.steps.length})
                </p>
                <p className="text-[10px] text-white/20">supply · type · action</p>
              </div>

              {build.steps.map((step, i) => (
                <StepRow
                  key={i}
                  step={step}
                  index={i}
                  total={build.steps.length}
                  expanded={expandedIdx === i}
                  myRace={build.myRace}
                  onToggle={() => setExpandedIdx((prev) => (prev === i ? null : i))}
                  onUpdate={(s) => updateStep(i, s)}
                  onDelete={() => deleteStep(i)}
                  onMove={(dir) => moveStep(i, dir)}
                  onEnter={() => addStepAfter(i)}
                />
              ))}

              {/* Text import panel */}
              {showTextImport && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2 mt-2">
                  <p className="text-[10px] text-amber-300/60">
                    Paste build order text — one step per line. Prefix with supply if you have it:{" "}
                    <span className="font-mono">10/20 Headhunter × 2</span>
                  </p>
                  <textarea
                    rows={6}
                    autoFocus
                    className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/40 resize-none font-mono"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={"6/10 train 2 Peons, 4 to gold, 1 builds Altar\n7/10 1st new Peon builds Burrow\n10/20 Altar finishes - train Farseer\n17/20 tech to T2 Stronghold\n17/30 build 2 Grunts, then 1 Headhunter\n25/30 hire Firelord from Tavern"}
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
                className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.12] text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-all mt-1"
              >
                + Add Step
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-4">Live Preview</p>
                {build.steps.length > 0
                  ? <BuildOrderTimeline buildOrders={[{ ...build, isCustom: true }]} />
                  : <p className="text-sm text-white/25 text-center py-4">Add steps to see a preview</p>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Auth modal ─────────────────────────────────────────────────── */}
      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setPendingSaveAfterAuth(false); }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
