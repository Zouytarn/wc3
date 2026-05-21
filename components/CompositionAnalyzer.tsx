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
import { UnitCard } from "@/components/UnitCard";
import { HeroCard } from "@/components/HeroCard";
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

function ToggleChip({ label, sub, iconSrc, active, onClick }: { label: string; sub: string; iconSrc: string; active: boolean; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition-all duration-150",
        active ? "border-amber-500/40 bg-amber-500/10 text-white" : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/[0.15] hover:text-white/60"
      )}
    >
      <div className={cn("relative h-8 w-8 flex-shrink-0 overflow-hidden border", active ? "border-amber-500/40" : "border-white/[0.08]")}>
        <Image src={iconSrc} alt={label} fill className="object-cover" unoptimized />
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate text-[11px]">{label}</p>
        <p className="text-[10px] text-white/25 truncate">{sub}</p>
      </div>
    </button>
  );
}

interface CompositionAnalyzerProps { myRace: Race; enemyRace: Race; defaultResult: MatchupResult; }

export function CompositionAnalyzer({ myRace, enemyRace, defaultResult }: CompositionAnalyzerProps) {
  const allEnemyUnits = UNITS_BY_RACE[enemyRace];
  const allEnemyHeroes = HEROES_BY_RACE[enemyRace];
  const myUnits = UNITS_BY_RACE[myRace];
  const myHeroes = HEROES_BY_RACE[myRace];
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(new Set());
  const buildOrder = getBuildOrder(myRace, enemyRace);
  const heroFirstId = buildOrder?.heroFirst;
  const toggleUnit = (id: string) => setSelectedUnitIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleHero = (id: string) => setSelectedHeroIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
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

  // If the expanded card is at an odd index (col 2), swap it with its left neighbor
  // so col-span-2 always starts from column 1, preventing layout gaps.
  function reorderForExpand(scores: typeof recommended) {
    if (!expandedUnitId) return scores;
    const idx = scores.findIndex((s) => s.unit.id === expandedUnitId);
    if (idx <= 0 || idx % 2 === 0) return scores;
    const result = [...scores];
    [result[idx - 1], result[idx]] = [result[idx], result[idx - 1]];
    return result;
  }

  function renderUnitGrid(scores: typeof recommended, className?: string) {
    const ordered = reorderForExpand(scores);
    return (
      <div className={cn("grid grid-cols-2 gap-2.5 items-start", className)}>
        {ordered.map((score) => (
          <UnitCard
            key={score.unit.id}
            score={score}
            expanded={expandedUnitId === score.unit.id}
            onToggle={() => setExpandedUnitId(expandedUnitId === score.unit.id ? null : score.unit.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Composition picker — always visible */}
      <div className="bg-white/[0.05] border border-white/[0.09] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-white">Enemy Composition</p>
              {isCustomMode && (
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-400 font-medium">
                  {selectedUnitIds.size + selectedHeroIds.size} selected
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/35 mt-0.5">
              Select what the enemy is running for tailored counter-picks
            </p>
          </div>
          {hasSelection && (
            <button onClick={() => { setSelectedUnitIds(new Set()); setSelectedHeroIds(new Set()); }} className="rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:border-white/[0.18] transition-colors flex-shrink-0 ml-4">
              Clear all
            </button>
          )}
        </div>

        <div className="border-t border-white/[0.06] px-4 sm:px-5 pb-5 pt-4 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Enemy Heroes</p>
              {selectedHeroIds.size > 0 && <button onClick={() => setSelectedHeroIds(new Set())} className="text-[11px] text-white/25 hover:text-white/60">clear</button>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {allEnemyHeroes.map((h) => <ToggleChip key={h.id} label={h.name} sub={`${h.primaryStat} · ${h.range}`} iconSrc={getHeroIcon(h.id)} active={selectedHeroIds.has(h.id)} onClick={() => toggleHero(h.id)} />)}
            </div>
          </div>
          {[1, 2, 3].map((tier) => (
            <div key={tier}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Tier {tier} Units</p>
                {unitsByTier[tier].some((u) => selectedUnitIds.has(u.id)) && (
                  <button onClick={() => setSelectedUnitIds((p) => { const n = new Set(p); unitsByTier[tier].forEach((u) => n.delete(u.id)); return n; })} className="text-[11px] text-white/25 hover:text-white/60">clear tier {tier}</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {unitsByTier[tier].map((u) => <ToggleChip key={u.id} label={u.name} sub={`${ATTACK_TYPE_LABELS[u.attackType]} / ${ARMOR_TYPE_LABELS[u.armorType]}`} iconSrc={getUnitIcon(u.id)} active={selectedUnitIds.has(u.id)} onClick={() => toggleUnit(u.id)} />)}
              </div>
            </div>
          ))}
          {!hasSelection && (
            <p className="text-[11px] text-white/25 pt-1">Select units/heroes above for precise counter-picks</p>
          )}
        </div>
      </div>

      {/* Active composition strip */}
      {isCustomMode && (
        <div className="bg-white/[0.05] border border-white/[0.09] rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-white/40 font-medium mr-1">Analyzing vs:</span>
            {allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id)).map((h) => (
              <span key={h.id} className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 pl-1 pr-2.5 py-0.5 text-amber-300">
                <span className="relative h-4 w-4 overflow-hidden rounded-full flex-shrink-0"><Image src={getHeroIcon(h.id)} alt={h.name} fill className="object-cover" unoptimized /></span>
                {h.name}
              </span>
            ))}
            {allEnemyUnits.filter((u) => selectedUnitIds.has(u.id)).map((u) => (
              <span key={u.id} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] pl-1 pr-2.5 py-0.5 text-white/60">
                <span className="relative h-4 w-4 overflow-hidden rounded-full flex-shrink-0"><Image src={getUnitIcon(u.id)} alt={u.name} fill className="object-cover" unoptimized /></span>
                {u.name}
              </span>
            ))}
          </div>
          <CompositionInsights
            selectedUnits={allEnemyUnits.filter((u) => selectedUnitIds.has(u.id))}
            selectedHeroes={allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id))}
          />
        </div>
      )}

      {/* Units */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Unit Recommendations</p>
          {isCustomMode && <span className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] text-amber-400">Custom</span>}
        </div>
        {!isCustomMode && (
          <p className="mb-4 text-xs text-white/35">
            Ranked vs all {RACE_LABELS[enemyRace]} units. Select specific units above for precise results.
          </p>
        )}
        {recommended.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-medium text-emerald-400/80 mb-3">Recommended ({recommended.length})</p>
            {renderUnitGrid(recommended)}
          </div>
        )}
        {situational.length > 0 && (
          <details className="group mb-2.5">
            <summary className="cursor-pointer text-xs font-medium text-white/40 mb-3 list-none flex items-center gap-2 hover:text-white/70 transition-colors">
              <span className="group-open:rotate-90 transition-transform text-white/20">▶</span>
              Situational ({situational.length})
            </summary>
            {renderUnitGrid(situational, "mt-3")}
          </details>
        )}
        {avoid.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-red-400/60 mb-3 list-none flex items-center gap-2 hover:text-red-400/80 transition-colors">
              <span className="group-open:rotate-90 transition-transform text-white/20">▶</span>
              Avoid ({avoid.length})
            </summary>
            {renderUnitGrid(avoid, "mt-3")}
          </details>
        )}
      </section>

      {/* Heroes */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Hero Recommendations</p>
          {isCustomMode && <span className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] text-amber-400">Custom</span>}
        </div>
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {activeHeroScores.map((score) => <HeroCard key={score.hero.id} score={score} />)}
        </div>
      </section>
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
    <div className="mt-3 space-y-1.5">
      {insights.map((insight, i) => (
        <div key={i} className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-xs", insight.type === "warning" ? "bg-red-500/10 text-red-300/80" : "bg-emerald-500/10 text-emerald-300/80")}>
          <span className="flex-shrink-0 mt-0.5">{insight.type === "warning" ? "⚠" : "→"}</span>
          {insight.text}
        </div>
      ))}
    </div>
  );
}
