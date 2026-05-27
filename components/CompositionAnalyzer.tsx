"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { UNITS_BY_RACE, RACE_LABELS, type Race, type Unit } from "@/data/units";
import { HEROES_BY_RACE, type Hero } from "@/data/heroes";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getUnitIcon, getHeroIcon } from "@/data/icons";
import { computeMatchup, type MatchupResult, type UnitMatchupScore, type HeroMatchupScore } from "@/lib/matchup-engine";
import { DAMAGE_MATRIX, getEffectivenessLabel } from "@/data/damage-matrix";
import { getBuildOrder } from "@/data/build-orders";
import { UnitTooltip } from "@/components/UnitTooltip";
import { HeroCard, HeroExpandedPanel } from "@/components/HeroCard";
import { HeroTooltip } from "@/components/HeroTooltip";
import { MatchupMatrixModal } from "@/components/MatchupMatrixModal";
import { CompactUnitDetail } from "@/components/UnitDetailContent";
import { getRecommendationColor, getRecommendationLabel } from "@/lib/matchup-engine";
import { cn } from "@/lib/utils";

function scoreUnitVsComposition(unit: Unit, enemyUnits: Unit[], enemyHeroes: Hero[]): UnitMatchupScore {
  const allTargets = [
    ...enemyUnits,
    ...enemyHeroes.map((h) => ({ id: h.id, name: h.name, attackType: h.attackType, armorType: h.armorType } as Unit)),
  ];
  if (allTargets.length === 0) {
    return { unit, offensiveScore: 1.0, defensiveScore: 1.0, overallScore: 1.0, effectivenessVsEnemyUnits: [], explanation: "No composition selected.", recommendation: "situational" };
  }
  const details = allTargets.map((t) => ({
    enemyUnit: t,
    multiplier: DAMAGE_MATRIX[unit.attackType][t.armorType],
    label: getEffectivenessLabel(DAMAGE_MATRIX[unit.attackType][t.armorType]),
  }));
  const offensiveScore = details.reduce((s, d) => s + d.multiplier, 0) / details.length;
  const allAttackers = [...enemyUnits, ...enemyHeroes.map((h) => ({ attackType: h.attackType } as Unit))];
  const avgIncoming = allAttackers.length > 0
    ? allAttackers.reduce((s, e) => s + DAMAGE_MATRIX[e.attackType][unit.armorType], 0) / allAttackers.length
    : 1.0;
  const defensiveScore = 1 / avgIncoming;
  const overallScore = offensiveScore * 0.65 + defensiveScore * 0.35;
  const strongVs = details.filter((d) => d.multiplier >= 1.25).map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);
  const weakVs = details.filter((d) => d.multiplier < 0.75).map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);
  let explanation = `${unit.name} uses ${unit.attackType} attack. `;
  if (strongVs.length > 0) explanation += `Bonus damage vs: ${strongVs.join(", ")}. `;
  if (weakVs.length > 0) explanation += `Reduced vs: ${weakVs.join(", ")}. `;
  if (!strongVs.length && !weakVs.length) explanation += "Consistent damage across selected composition.";
  const recommendation: UnitMatchupScore["recommendation"] =
    overallScore >= 1.3 ? "highly_recommended" : overallScore >= 1.05 ? "recommended" : overallScore >= 0.85 ? "situational" : "avoid";
  return { unit, offensiveScore, defensiveScore, overallScore, effectivenessVsEnemyUnits: details, explanation, recommendation };
}

function scoreHeroVsComposition(hero: Hero, enemyRace: Race, enemyUnits: Unit[], enemyHeroes: Hero[], isFirstPick: boolean): HeroMatchupScore {
  const allTargets = [...enemyUnits, ...enemyHeroes.map((h) => ({ armorType: h.armorType } as Unit))];
  let relevanceScore = isFirstPick ? 2.0 : 1.0;
  const strongPoints: string[] = [];
  const weakPoints: string[] = [];
  if (isFirstPick) strongPoints.unshift("Recommended first hero pick for this matchup");
  if (allTargets.length > 0) {
    const avgMult = allTargets.reduce((s, t) => s + DAMAGE_MATRIX[hero.attackType][t.armorType], 0) / allTargets.length;
    relevanceScore *= avgMult;
  }
  if (!isFirstPick && hero.strongVs.includes(enemyRace)) { relevanceScore += 0.3; strongPoints.push(`Generally strong vs ${RACE_LABELS[enemyRace]}`); }
  const hasHeavy = allTargets.some((t) => t.armorType === "heavy");
  const hasLight = allTargets.some((t) => t.armorType === "light");
  const hasManyUnits = allTargets.length >= 4;
  const enemyHeroNames = enemyHeroes.map((h) => h.name.toLowerCase());
  for (const ability of hero.abilities) {
    const desc = ability.description.toLowerCase();
    const name = ability.name.toLowerCase();
    if (ability.type === "aura") { strongPoints.push(`${ability.name} aura boosts your army`); relevanceScore += 0.2; }
    if ((name.includes("hex") || desc.includes("hex")) && enemyHeroNames.some((n) => n.includes("paladin"))) { strongPoints.push("Hex disables Paladin — shuts down Holy Light"); relevanceScore += 0.35; }
    if ((desc.includes("mana burn") || name.includes("mana burn")) && (enemyHeroNames.some((n) => n.includes("archmage")) || enemyUnits.some((u) => u.id === "priest"))) { strongPoints.push("Mana Burn destroys Archmage/Priest mana pool"); relevanceScore += 0.3; }
    if (desc.includes("stun") || desc.includes("root") || desc.includes("hex")) { strongPoints.push(`${ability.name} provides crowd control`); relevanceScore += 0.1; }
    if (ability.type === "ultimate" && hasManyUnits) { strongPoints.push(`${ability.name} ultimate strong vs large ${RACE_LABELS[enemyRace]} army`); relevanceScore += 0.05; }
    if (hasHeavy && desc.includes("magic")) { strongPoints.push(`${ability.name} magic damage is 200% vs heavy armor`); relevanceScore += 0.15; }
    if (hasLight && name.includes("fan of knives")) { strongPoints.push("Fan of Knives devastates grouped light-armor units"); relevanceScore += 0.3; }
  }
  if (hero.role === "int") weakPoints.push("Fragile — keep behind frontline.");
  if (hero.range === "melee" && enemyRace === "nightelf") weakPoints.push("Vulnerable to Keeper Entangle.");
  const recommendation: HeroMatchupScore["recommendation"] =
    isFirstPick ? "primary" : relevanceScore >= 1.5 ? "primary" : relevanceScore >= 1.1 ? "secondary" : "situational";
  return { hero, relevanceScore, strongPoints, weakPoints, recommendation };
}

// ── Ranked unit list row ─────────────────────────────────────────────────────
function UnitRow({
  score,
  rank,
  expanded,
  onToggle,
}: {
  score: UnitMatchupScore;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { unit, offensiveScore, defensiveScore, overallScore, explanation, effectivenessVsEnemyUnits, recommendation } = score;
  const pct = Math.round(overallScore * 100);

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Rank */}
        <span className="font-mono text-[10px] text-white/20 w-5 flex-shrink-0 tabular-nums text-right">
          {String(rank).padStart(2, "0")}
        </span>

        {/* Icon */}
        <UnitTooltip unit={unit}>
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden border border-white/[0.10] cursor-help">
            <Image src={getUnitIcon(unit.id)} alt={unit.name} fill className="object-cover" unoptimized />
          </div>
        </UnitTooltip>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-white">{unit.name}</span>
            <span className={cn("font-mono text-[10px] tracking-[0.08em] uppercase", getRecommendationColor(recommendation))}>
              {getRecommendationLabel(recommendation)}
            </span>
          </div>
          <div className="font-mono text-[10px] text-white/25 mt-0.5">
            T{unit.tier} · {unit.goldCost}g · {ATTACK_TYPE_LABELS[unit.attackType]} / {ARMOR_TYPE_LABELS[unit.armorType]}
          </div>
        </div>

        {/* Mini bars + score */}
        <div className="hidden sm:flex flex-col gap-1 w-20 flex-shrink-0">
          {[
            { label: "OFF", val: offensiveScore, color: "bg-emerald-500", tc: "text-emerald-500/60" },
            { label: "DEF", val: defensiveScore, color: "bg-blue-400",    tc: "text-blue-400/60"   },
          ].map(({ label, val, color, tc }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={cn("font-mono text-[9px] w-5 flex-shrink-0", tc)}>{label}</span>
              <div className="flex-1 h-[2px] bg-white/[0.06]">
                <div className={color} style={{ width: `${Math.min(val * 70, 100)}%`, height: "100%" }} />
              </div>
            </div>
          ))}
        </div>

        <span className="font-mono text-xs font-semibold text-white/50 tabular-nums w-9 text-right flex-shrink-0">
          {pct}%
        </span>
        <span className={cn("text-white/20 text-[10px] transition-transform duration-150 flex-shrink-0", expanded && "rotate-180")}>▼</span>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.05]">
          {/* Explanation banner */}
          {explanation && (
            <p className="text-[11px] text-white/40 leading-relaxed px-4 pt-3 pb-3 border-b border-white/[0.04]">
              {explanation}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.05]">
            {/* Left: compact unit stats + abilities */}
            <div className="px-4 py-4">
              <CompactUnitDetail unit={unit} />
            </div>

            {/* Right: effectiveness list — compact, no scroll needed for short lists */}
            <div className="px-4 py-4">
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 mb-2.5">
                vs Enemy
              </p>
              <div className="space-y-px">
                {[...effectivenessVsEnemyUnits]
                  .sort((a, b) => b.multiplier - a.multiplier)
                  .map(({ enemyUnit, multiplier }) => (
                    <div key={enemyUnit.id} className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="relative h-4 w-4 overflow-hidden flex-shrink-0">
                          <Image src={getUnitIcon(enemyUnit.id)} alt={enemyUnit.name} fill className="object-cover" unoptimized />
                        </div>
                        <span className="text-white/35 truncate text-[10px]">{enemyUnit.name}</span>
                      </div>
                      <span className={cn(
                        "font-mono font-semibold flex-shrink-0 text-[10px] tabular-nums",
                        multiplier >= 1.5 ? "text-emerald-400" : multiplier >= 1.0 ? "text-amber-400" : "text-red-400"
                      )}>
                        {Math.round(multiplier * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Portrait-style unit/hero selector chip ──────────────────────────────────
function ToggleChip({
  label,
  sub,
  iconSrc,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  iconSrc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 py-3 px-2 w-full rounded-xl border transition-colors duration-100",
        active
          ? "border-amber-500/50 bg-amber-500/[0.06] text-white"
          : "border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white/65"
      )}
    >
      <div className={cn(
        "relative h-12 w-12 overflow-hidden border flex-shrink-0",
        active ? "border-amber-500/40" : "border-white/[0.10]"
      )}>
        <Image src={iconSrc} alt={label} fill className="object-cover" unoptimized />
      </div>
      <div className="min-w-0 w-full px-1">
        <p className="text-[11px] font-medium leading-tight truncate">{label}</p>
        <p className="text-[9px] font-mono text-white/25 mt-0.5 truncate">{sub}</p>
      </div>
    </button>
  );
}

// ── Hairline section divider ─────────────────────────────────────────────────
function PickerSection({
  label,
  showClear,
  onClear,
  children,
}: {
  label: string;
  showClear: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35 flex-shrink-0">
          {label}
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
        {showClear && (
          <button
            onClick={onClear}
            className="font-mono text-[10px] text-white/25 hover:text-white/55 transition-colors flex-shrink-0"
          >
            clear
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

interface CompositionAnalyzerProps { myRace: Race; enemyRace: Race; defaultResult: MatchupResult; }

export function CompositionAnalyzer({ myRace, enemyRace, defaultResult }: CompositionAnalyzerProps) {
  const allEnemyUnits = UNITS_BY_RACE[enemyRace];
  const allEnemyHeroes = HEROES_BY_RACE[enemyRace];
  const myUnits = UNITS_BY_RACE[myRace];
  const myHeroes = HEROES_BY_RACE[myRace];
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [expandedHeroId, setExpandedHeroId] = useState<string | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(new Set());
  const [showMatrix, setShowMatrix] = useState(false);
  const buildOrder = getBuildOrder(myRace, enemyRace);
  const heroFirstId = buildOrder?.heroFirst;
  const toggleUnit = (id: string) => setSelectedUnitIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleHero = (id: string) => setSelectedHeroIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearAll = () => { setSelectedUnitIds(new Set()); setSelectedHeroIds(new Set()); };
  const hasSelection = selectedUnitIds.size > 0 || selectedHeroIds.size > 0;

  const customResult = useMemo(() => {
    if (!hasSelection) return null;
    const su = allEnemyUnits.filter((u) => selectedUnitIds.has(u.id));
    const sh = allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id));
    return {
      unitScores: myUnits.map((u) => scoreUnitVsComposition(u, su, sh)).sort((a, b) => b.overallScore - a.overallScore),
      heroScores: myHeroes.map((h) => scoreHeroVsComposition(h, enemyRace, su, sh, h.id === heroFirstId)).sort((a, b) => b.relevanceScore - a.relevanceScore),
    };
  }, [selectedUnitIds, selectedHeroIds, allEnemyUnits, allEnemyHeroes, myUnits, myHeroes, enemyRace, heroFirstId]);

  const activeUnitScores = (hasSelection && customResult) ? customResult.unitScores : defaultResult.unitScores;
  const activeHeroScores = (hasSelection && customResult) ? customResult.heroScores : defaultResult.heroScores;
  const isCustomMode = hasSelection;
  const unitsByTier: Record<number, Unit[]> = { 1: [], 2: [], 3: [] };
  allEnemyUnits.forEach((u) => { if (u.tier in unitsByTier) unitsByTier[u.tier].push(u); });
  const recommended = activeUnitScores.filter((s) => s.recommendation === "highly_recommended" || s.recommendation === "recommended");
  const situational  = activeUnitScores.filter((s) => s.recommendation === "situational");
  const avoid        = activeUnitScores.filter((s) => s.recommendation === "avoid");

  function reorderForExpand(scores: typeof recommended) {
    if (!expandedUnitId) return scores;
    const idx = scores.findIndex((s) => s.unit.id === expandedUnitId);
    if (idx <= 0 || idx % 2 === 0) return scores;
    const result = [...scores];
    [result[idx - 1], result[idx]] = [result[idx], result[idx - 1]];
    return result;
  }

  function renderUnitList(scores: typeof recommended, startRank = 1) {
    return (
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">
        {scores.map((score, idx) => (
          <UnitRow
            key={score.unit.id}
            score={score}
            rank={startRank + idx}
            expanded={expandedUnitId === score.unit.id}
            onToggle={() => setExpandedUnitId(expandedUnitId === score.unit.id ? null : score.unit.id)}
          />
        ))}
      </div>
    );
  }

  function renderHeroGrid(scores: typeof activeHeroScores) {
    const expandedScore = scores.find((s) => s.hero.id === expandedHeroId);
    return (
      <div className="space-y-3">
        {/* Portrait strip — equal height, 2 on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {scores.map((score) => (
            <HeroCard
              key={score.hero.id}
              score={score}
              expanded={expandedHeroId === score.hero.id}
              onToggle={() => setExpandedHeroId(expandedHeroId === score.hero.id ? null : score.hero.id)}
            />
          ))}
        </div>
        {/* Full-width detail panel below the strip */}
        {expandedScore && (
          <HeroExpandedPanel score={expandedScore} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* ── Enemy composition picker ──────────────────────────────── */}
      <div className="space-y-5">

        {/* Top bar: instruction + clear all */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/35 leading-relaxed">
            Select what the enemy is running for tailored counter-picks
          </p>
          {hasSelection && (
            <button
              onClick={clearAll}
              className="font-mono text-[10px] tracking-[0.1em] text-white/25 hover:text-white/55 transition-colors flex-shrink-0 ml-4"
            >
              Clear all · {selectedUnitIds.size + selectedHeroIds.size}
            </button>
          )}
        </div>

        {/* Heroes */}
        <PickerSection
          label="Enemy Heroes"
          showClear={selectedHeroIds.size > 0}
          onClear={() => setSelectedHeroIds(new Set())}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {allEnemyHeroes.map((h) => (
              <HeroTooltip key={h.id} hero={h} className="w-full min-w-0">
                <ToggleChip
                  label={h.name}
                  sub={`${h.primaryStat} · ${h.range}`}
                  iconSrc={getHeroIcon(h.id)}
                  active={selectedHeroIds.has(h.id)}
                  onClick={() => toggleHero(h.id)}
                />
              </HeroTooltip>
            ))}
          </div>
        </PickerSection>

        {/* Units by tier */}
        {[1, 2, 3].map((tier) => (
          <PickerSection
            key={tier}
            label={`Tier ${tier} Units`}
            showClear={unitsByTier[tier].some((u) => selectedUnitIds.has(u.id))}
            onClear={() => setSelectedUnitIds((p) => {
              const n = new Set(p);
              unitsByTier[tier].forEach((u) => n.delete(u.id));
              return n;
            })}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {unitsByTier[tier].map((u) => (
                <UnitTooltip key={u.id} unit={u} className="w-full min-w-0">
                  <ToggleChip
                    label={u.name}
                    sub={`${ATTACK_TYPE_LABELS[u.attackType]} / ${ARMOR_TYPE_LABELS[u.armorType]}`}
                    iconSrc={getUnitIcon(u.id)}
                    active={selectedUnitIds.has(u.id)}
                    onClick={() => toggleUnit(u.id)}
                  />
                </UnitTooltip>
              ))}
            </div>
          </PickerSection>
        ))}

        {!hasSelection && (
          <p className="font-mono text-[10px] text-white/20 tracking-[0.05em]">
            No units selected — showing default rankings vs all {RACE_LABELS[enemyRace]} units
          </p>
        )}
      </div>

      {/* ── Composition insights (warnings/tips) ─────────────────── */}
      {isCustomMode && (
        <CompositionInsights
          selectedUnits={allEnemyUnits.filter((u) => selectedUnitIds.has(u.id))}
          selectedHeroes={allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id))}
        />
      )}

      {/* ── Unit recommendations ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35 flex-shrink-0">
            Unit Recommendations
          </span>
          <div className="h-px flex-1 bg-white/[0.07]" />
          {isCustomMode && (
            <span className="font-mono text-[10px] text-amber-400/60 flex-shrink-0">Custom</span>
          )}
          <button
            onClick={() => setShowMatrix(true)}
            className="flex-shrink-0 border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-mono text-white/35 hover:text-white/65 hover:border-white/[0.15] transition-colors"
          >
            Matrix
          </button>
        </div>

        {!isCustomMode && (
          <p className="text-xs text-white/30 mb-4 leading-relaxed">
            Ranked vs all {RACE_LABELS[enemyRace]} units. Select specific units above for precise results.
          </p>
        )}

        {recommended.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/70">Recommended</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="font-mono text-[10px] text-white/20">{recommended.length}</span>
            </div>
            {renderUnitList(recommended, 1)}
          </div>
        )}

        {situational.length > 0 && (
          <details className="group mb-3">
            <summary className="cursor-pointer list-none mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35 group-open:text-white/55 transition-colors">Situational</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="font-mono text-[10px] text-white/20">{situational.length}</span>
                <span className="font-mono text-[10px] text-white/15 group-open:rotate-180 transition-transform inline-block">▼</span>
              </div>
            </summary>
            <div className="mt-3">{renderUnitList(situational, recommended.length + 1)}</div>
          </details>
        )}

        {avoid.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-red-400/50 group-open:text-red-400/70 transition-colors">Avoid</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="font-mono text-[10px] text-white/20">{avoid.length}</span>
                <span className="font-mono text-[10px] text-white/15 group-open:rotate-180 transition-transform inline-block">▼</span>
              </div>
            </summary>
            <div className="mt-3">{renderUnitList(avoid, recommended.length + situational.length + 1)}</div>
          </details>
        )}
      </section>

      {/* ── Hero recommendations ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35 flex-shrink-0">
            Hero Recommendations
          </span>
          <div className="h-px flex-1 bg-white/[0.07]" />
          {isCustomMode && (
            <span className="font-mono text-[10px] text-amber-400/60 flex-shrink-0">Custom</span>
          )}
        </div>
        {renderHeroGrid(activeHeroScores)}
      </section>

      {/* Matchup Matrix modal */}
      {showMatrix && (
        <MatchupMatrixModal
          enemyUnits={hasSelection ? allEnemyUnits.filter((u) => selectedUnitIds.has(u.id)) : allEnemyUnits}
          myUnitScores={activeUnitScores}
          isCustomMode={isCustomMode}
          onClose={() => setShowMatrix(false)}
        />
      )}
    </div>
  );
}

function CompositionInsights({ selectedUnits, selectedHeroes }: { selectedUnits: Unit[]; selectedHeroes: Hero[] }) {
  const insights: { text: string; type: "tip" | "warning" }[] = [];
  const hasPaladin      = selectedHeroes.some((h) => h.id === "paladin");
  const hasArchmage     = selectedHeroes.some((h) => h.id === "archmage");
  const hasMK           = selectedHeroes.some((h) => h.id === "mountain_king");
  const hasBloodMage    = selectedHeroes.some((h) => h.id === "blood_mage");
  const hasRifles       = selectedUnits.some((u) => u.id === "rifleman");
  const hasSorceress    = selectedUnits.some((u) => u.id === "sorceress");
  const hasPriest       = selectedUnits.some((u) => u.id === "priest");
  const hasKnights      = selectedUnits.some((u) => u.id === "knight");
  const hasGryphons     = selectedUnits.some((u) => u.id === "gryphon_rider");
  const hasSpellBreaker = selectedUnits.some((u) => u.id === "spell_breaker");
  const hasMortar       = selectedUnits.some((u) => u.id === "mortar_team");
  if (hasPaladin)      insights.push({ text: "Paladin Holy Light heals 400–600 HP — need burst to outpace. Hex shuts him down completely.", type: "warning" });
  if (hasArchmage)     insights.push({ text: "Brilliance Aura keeps all casters at full mana. Mass Teleport lets them escape — always have vision.", type: "warning" });
  if (hasMK)           insights.push({ text: "Storm Bolt stuns your hero 2–4s — spread heroes apart. Avatar = spell immune, don't waste Hex.", type: "warning" });
  if (hasBloodMage)    insights.push({ text: "Banish + Gryphon = massive magic burst. Spread heavy-armor units.", type: "warning" });
  if (hasRifles)       insights.push({ text: "Rifles (Piercing) vs Light armor = 200% damage. Headhunters also Piercing — hard counter to mass Rifles.", type: "tip" });
  if (hasSorceress)    insights.push({ text: "Sorceress Slow halves your attack and move speed, killing Bloodlust value. Shaman Purge removes it immediately.", type: "warning" });
  if (hasPriest)       insights.push({ text: "Priest Heal sustains the frontline. Resurrection can revive 6 units — kill Priest first.", type: "warning" });
  if (hasKnights)      insights.push({ text: "Knights have Heavy armor — magic attacks deal 200% vs them. Avoid Normal-attack units as counters.", type: "tip" });
  if (hasGryphons)     insights.push({ text: "Gryphon magic attack deals 200% vs your Heavy-armored Grunts/Taurens. Raider Ensnare grounds them immediately.", type: "warning" });
  if (hasSpellBreaker) insights.push({ text: "Spell Breakers drain mana and dispel Bloodlust on hit. Keep casters away from Spell Breakers.", type: "warning" });
  if (hasMortar)       insights.push({ text: "Mortar splash punishes clumped armies. Mortars are fragile in melee — rush them with Grunts.", type: "warning" });
  if (insights.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-2.5 border-l-2 pl-3 py-1 text-[11px] leading-relaxed",
            insight.type === "warning"
              ? "border-red-500/40 text-red-300/65"
              : "border-emerald-500/40 text-emerald-300/65"
          )}
        >
          <span className="flex-shrink-0 font-mono text-[10px] mt-0.5">
            {insight.type === "warning" ? "!" : "+"}
          </span>
          {insight.text}
        </div>
      ))}
    </div>
  );
}
