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

// ---- Custom matchup computation for a specific enemy composition ----

function scoreUnitVsComposition(
  unit: Unit,
  enemyUnits: Unit[],
  enemyHeroes: Hero[]
): UnitMatchupScore {
  // Combine enemy units + heroes as "targets"
  const allTargets = [
    ...enemyUnits,
    // Treat heroes as units with their armor type for calculation
    ...enemyHeroes.map((h) => ({
      id: h.id,
      name: h.name,
      attackType: h.attackType,
      armorType: h.armorType,
    } as Unit)),
  ];

  if (allTargets.length === 0) {
    return {
      unit,
      offensiveScore: 1.0,
      defensiveScore: 1.0,
      overallScore: 1.0,
      effectivenessVsEnemyUnits: [],
      explanation: "No enemy composition selected — showing base stats.",
      recommendation: "situational",
    };
  }

  const details = allTargets.map((target) => ({
    enemyUnit: target,
    multiplier: DAMAGE_MATRIX[unit.attackType][target.armorType],
    label: getEffectivenessLabel(DAMAGE_MATRIX[unit.attackType][target.armorType]),
  }));

  const offensiveScore = details.reduce((s, d) => s + d.multiplier, 0) / details.length;

  // Defensive: how much do enemy units/heroes deal to this unit?
  const allAttackers = [
    ...enemyUnits,
    ...enemyHeroes.map((h) => ({ attackType: h.attackType } as Unit)),
  ];
  const avgIncoming =
    allAttackers.length > 0
      ? allAttackers.reduce((s, e) => s + DAMAGE_MATRIX[e.attackType][unit.armorType], 0) / allAttackers.length
      : 1.0;
  const defensiveScore = 1 / avgIncoming;

  const overallScore = offensiveScore * 0.65 + defensiveScore * 0.35;

  const strongVs = details
    .filter((d) => d.multiplier >= 1.25)
    .map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);
  const weakVs = details
    .filter((d) => d.multiplier < 0.75)
    .map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);

  let explanation = `${unit.name} uses ${unit.attackType} attack. `;
  if (strongVs.length > 0) explanation += `Bonus damage vs: ${strongVs.join(", ")}. `;
  if (weakVs.length > 0) explanation += `Reduced vs: ${weakVs.join(", ")}. `;
  if (strongVs.length === 0 && weakVs.length === 0)
    explanation += "Consistent damage against selected enemy composition.";

  const recommendation: UnitMatchupScore["recommendation"] =
    overallScore >= 1.3 ? "highly_recommended" :
    overallScore >= 1.05 ? "recommended" :
    overallScore >= 0.85 ? "situational" : "avoid";

  return { unit, offensiveScore, defensiveScore, overallScore, effectivenessVsEnemyUnits: details, explanation, recommendation };
}

function scoreHeroVsComposition(
  hero: Hero,
  enemyRace: Race,
  enemyUnits: Unit[],
  enemyHeroes: Hero[],
  isFirstPick: boolean
): HeroMatchupScore {
  const allTargets = [
    ...enemyUnits,
    ...enemyHeroes.map((h) => ({ armorType: h.armorType } as Unit)),
  ];

  let relevanceScore = 1.0;
  const strongPoints: string[] = [];
  const weakPoints: string[] = [];

  if (isFirstPick) {
    relevanceScore = 2.0;
    strongPoints.unshift("Recommended first hero pick for this matchup");
  }

  // Offensive score vs selected composition
  if (allTargets.length > 0) {
    const avgMult = allTargets.reduce((s, t) => s + DAMAGE_MATRIX[hero.attackType][t.armorType], 0) / allTargets.length;
    relevanceScore *= avgMult;
  }

  if (!isFirstPick && hero.strongVs.includes(enemyRace)) {
    relevanceScore += 0.3;
    strongPoints.push(`Generally strong vs ${RACE_LABELS[enemyRace]}`);
  }

  // Ability synergies vs selected enemy composition
  const hasHeavyArmor = allTargets.some((t) => t.armorType === "heavy");
  const hasLightArmor = allTargets.some((t) => t.armorType === "light");
  const hasManyUnits = allTargets.length >= 4;
  const enemyHeroNames = enemyHeroes.map((h) => h.name.toLowerCase());
  const hasPaladin = enemyHeroNames.some((n) => n.includes("paladin"));
  const hasArcane = enemyHeroNames.some((n) => n.includes("archmage"));
  const hasPriest = enemyUnits.some((u) => u.id === "priest");
  const hasRifle = enemyUnits.some((u) => u.id === "rifleman");

  for (const ability of hero.abilities) {
    const desc = ability.description.toLowerCase();
    const name = ability.name.toLowerCase();

    if (ability.type === "aura") {
      strongPoints.push(`${ability.name} aura boosts your entire army`);
      relevanceScore += 0.2;
    }

    if ((name.includes("hex") || desc.includes("hex")) && hasPaladin) {
      strongPoints.push(`Hex disables Paladin — shuts down Holy Light healing`);
      relevanceScore += 0.35;
    }

    if ((desc.includes("mana burn") || name.includes("mana burn")) && (hasArcane || hasPriest)) {
      strongPoints.push(`Mana Burn destroys Archmage/Priest mana — cripples enemy caster support`);
      relevanceScore += 0.3;
    }

    if (desc.includes("purge") && hasPaladin) {
      strongPoints.push(`Purge removes Devotion Aura buff from enemy units`);
      relevanceScore += 0.2;
    }

    if ((desc.includes("heal") || desc.includes("healing wave")) && hasRifle) {
      strongPoints.push(`Healing Wave counters Rifle burst damage — sustains your army`);
      relevanceScore += 0.2;
    }

    if (desc.includes("stun") || desc.includes("root") || desc.includes("sleep") || desc.includes("hex")) {
      strongPoints.push(`${ability.name} provides crowd control — great for locking down Paladin`);
      relevanceScore += 0.1;
    }

    if (ability.type === "ultimate" && hasManyUnits) {
      strongPoints.push(`${ability.name} ultimate is strong vs large ${RACE_LABELS[enemyRace]} armies`);
      relevanceScore += 0.05;
    }

    if (hasHeavyArmor && desc.includes("magic")) {
      strongPoints.push(`${ability.name} magic damage is 200% vs heavy-armored enemies`);
      relevanceScore += 0.15;
    }

    if (hasLightArmor && name.includes("fan of knives")) {
      strongPoints.push(`Fan of Knives devastates grouped light-armor units like Riflemen`);
      relevanceScore += 0.3;
    }
  }

  if (hero.role === "int") weakPoints.push("Fragile — keep behind your frontline.");
  if (hero.range === "melee" && enemyRace === "nightelf") {
    weakPoints.push("Vulnerable to Keeper Entangle.");
  }

  const recommendation: HeroMatchupScore["recommendation"] =
    isFirstPick ? "primary" :
    relevanceScore >= 1.5 ? "primary" :
    relevanceScore >= 1.1 ? "secondary" : "situational";

  return { hero, relevanceScore, strongPoints, weakPoints, recommendation };
}

// ---- Toggle button component with icon ----

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
        "flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-all duration-150",
        active
          ? "border-amber-600 bg-amber-950/60 text-amber-300 shadow-md shadow-amber-950/40"
          : "border-slate-700 bg-black/30 text-slate-500 hover:border-slate-600 hover:text-slate-400"
      )}
    >
      <div className={cn(
        "relative h-8 w-8 flex-shrink-0 overflow-hidden rounded border",
        active ? "border-amber-700" : "border-slate-700"
      )}>
        <Image src={iconSrc} alt={label} fill className="object-cover" unoptimized />
      </div>
      <div className="min-w-0">
        <div className="font-bold truncate">{label}</div>
        <div className="text-[10px] opacity-70 truncate">{sub}</div>
      </div>
    </button>
  );
}

// ---- Main component ----

interface CompositionAnalyzerProps {
  myRace: Race;
  enemyRace: Race;
  defaultResult: MatchupResult;
}

export function CompositionAnalyzer({ myRace, enemyRace, defaultResult }: CompositionAnalyzerProps) {
  const allEnemyUnits = UNITS_BY_RACE[enemyRace];
  const allEnemyHeroes = HEROES_BY_RACE[enemyRace];
  const myUnits = UNITS_BY_RACE[myRace];
  const myHeroes = HEROES_BY_RACE[myRace];

  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(new Set());
  const [compositionMode, setCompositionMode] = useState(false);

  const buildOrder = getBuildOrder(myRace, enemyRace);
  const heroFirstId = buildOrder?.heroFirst;

  function toggleUnit(id: string) {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleHero(id: string) {
    setSelectedHeroIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const hasSelection = selectedUnitIds.size > 0 || selectedHeroIds.size > 0;

  // Recompute recommendations based on selected enemy composition
  const customResult = useMemo(() => {
    if (!compositionMode || !hasSelection) return null;

    const selectedUnits = allEnemyUnits.filter((u) => selectedUnitIds.has(u.id));
    const selectedHeroes = allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id));

    const unitScores: UnitMatchupScore[] = myUnits
      .map((unit) => scoreUnitVsComposition(unit, selectedUnits, selectedHeroes))
      .sort((a, b) => b.overallScore - a.overallScore);

    const heroScores: HeroMatchupScore[] = myHeroes
      .map((hero) =>
        scoreHeroVsComposition(
          hero,
          enemyRace,
          selectedUnits,
          selectedHeroes,
          hero.id === heroFirstId
        )
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return { unitScores, heroScores };
  }, [compositionMode, selectedUnitIds, selectedHeroIds, allEnemyUnits, allEnemyHeroes, myUnits, myHeroes, enemyRace, heroFirstId]);

  const activeUnitScores = (compositionMode && customResult) ? customResult.unitScores : defaultResult.unitScores;
  const activeHeroScores = (compositionMode && customResult) ? customResult.heroScores : defaultResult.heroScores;
  const isCustomMode = compositionMode && hasSelection;

  // Group units by role/tier for the picker
  const unitsByTier: Record<number, Unit[]> = { 1: [], 2: [], 3: [] };
  allEnemyUnits.forEach((u) => {
    if (u.tier in unitsByTier) unitsByTier[u.tier].push(u);
  });

  const recommended = activeUnitScores.filter(
    (s) => s.recommendation === "highly_recommended" || s.recommendation === "recommended"
  );
  const situational = activeUnitScores.filter((s) => s.recommendation === "situational");
  const avoid = activeUnitScores.filter((s) => s.recommendation === "avoid");

  return (
    <div className="space-y-8">
      {/* === ENEMY COMPOSITION PICKER === */}
      <div className="rounded-xl border border-amber-900/40 bg-black/30">
        <button
          onClick={() => setCompositionMode(!compositionMode)}
          className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 text-left hover:bg-amber-950/10 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <div className="font-bold text-amber-300">
                Enemy Composition Picker
                {isCustomMode && (
                  <span className="ml-2 rounded-full bg-amber-600 px-2 py-0.5 text-xs text-black font-bold">
                    ACTIVE — {selectedUnitIds.size + selectedHeroIds.size} selected
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {compositionMode
                  ? "Select which specific units & heroes the enemy is running to get tailored recommendations"
                  : "Click to specify exactly what the enemy is running — get precise counter-picks"}
              </div>
            </div>
          </div>
          <span className={cn("text-amber-600 transition-transform", compositionMode && "rotate-180")}>▼</span>
        </button>

        {compositionMode && (
          <div className="border-t border-amber-900/30 px-3 sm:px-5 pb-3 sm:pb-5 pt-3 sm:pt-4 space-y-4 sm:space-y-5">
            {/* Hero picker */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-bold text-amber-500">Enemy Heroes</div>
                {selectedHeroIds.size > 0 && (
                  <button
                    onClick={() => setSelectedHeroIds(new Set())}
                    className="text-[10px] text-slate-600 hover:text-slate-400"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {allEnemyHeroes.map((hero) => (
                  <ToggleChip
                    key={hero.id}
                    label={hero.name}
                    sub={`${hero.primaryStat} • ${hero.range}`}
                    iconSrc={getHeroIcon(hero.id)}
                    active={selectedHeroIds.has(hero.id)}
                    onClick={() => toggleHero(hero.id)}
                  />
                ))}
              </div>
            </div>

            {/* Unit picker grouped by tier */}
            {[1, 2, 3].map((tier) => (
              <div key={tier}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500">
                    Tier {tier} Units
                  </div>
                  {unitsByTier[tier].some((u) => selectedUnitIds.has(u.id)) && (
                    <button
                      onClick={() =>
                        setSelectedUnitIds((prev) => {
                          const next = new Set(prev);
                          unitsByTier[tier].forEach((u) => next.delete(u.id));
                          return next;
                        })
                      }
                      className="text-[10px] text-slate-600 hover:text-slate-400"
                    >
                      clear tier {tier}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {unitsByTier[tier].map((unit) => (
                    <ToggleChip
                      key={unit.id}
                      label={unit.name}
                      sub={`${ATTACK_TYPE_LABELS[unit.attackType]} / ${ARMOR_TYPE_LABELS[unit.armorType]}`}
                      iconSrc={getUnitIcon(unit.id)}
                      active={selectedUnitIds.has(unit.id)}
                      onClick={() => toggleUnit(unit.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              {hasSelection && (
                <button
                  onClick={() => {
                    setSelectedUnitIds(new Set());
                    setSelectedHeroIds(new Set());
                  }}
                  className="rounded-lg border border-slate-700 bg-black/40 px-4 py-2 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
                >
                  Clear all
                </button>
              )}
              <div className="text-xs text-slate-600">
                {hasSelection
                  ? `Showing recommendations vs ${selectedUnitIds.size} unit type${selectedUnitIds.size !== 1 ? "s" : ""}${selectedHeroIds.size > 0 ? ` + ${selectedHeroIds.size} hero${selectedHeroIds.size !== 1 ? "es" : ""}` : ""}`
                  : "Select units/heroes above to get tailored recommendations"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === CONTEXT BANNER when composition is active === */}
      {isCustomMode && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-amber-400">Analyzing vs:</span>
            {allEnemyHeroes
              .filter((h) => selectedHeroIds.has(h.id))
              .map((h) => (
                <span key={h.id} className="flex items-center gap-1.5 rounded-full border border-amber-700 bg-amber-900/40 pl-1 pr-2.5 py-0.5 text-amber-300">
                  <span className="relative h-5 w-5 overflow-hidden rounded-full flex-shrink-0">
                    <Image src={getHeroIcon(h.id)} alt={h.name} fill className="object-cover" unoptimized />
                  </span>
                  {h.name}
                </span>
              ))}
            {allEnemyUnits
              .filter((u) => selectedUnitIds.has(u.id))
              .map((u) => (
                <span key={u.id} className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 pl-1 pr-2.5 py-0.5 text-slate-300">
                  <span className="relative h-5 w-5 overflow-hidden rounded-full flex-shrink-0">
                    <Image src={getUnitIcon(u.id)} alt={u.name} fill className="object-cover" unoptimized />
                  </span>
                  {u.name}
                </span>
              ))}
          </div>
          {/* Key insight: what to focus on */}
          <CompositionInsights
            selectedUnits={allEnemyUnits.filter((u) => selectedUnitIds.has(u.id))}
            selectedHeroes={allEnemyHeroes.filter((h) => selectedHeroIds.has(h.id))}
          />
        </div>
      )}

      {/* === UNIT RECOMMENDATIONS === */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-xl font-bold text-amber-400">🗡️ Unit Recommendations</h3>
          {isCustomMode && (
            <span className="rounded-full bg-amber-900/40 border border-amber-700 px-2 py-0.5 text-xs text-amber-400">
              Custom composition
            </span>
          )}
        </div>

        {!isCustomMode && (
          <p className="mb-4 text-xs text-slate-500">
            Ranked vs all {RACE_LABELS[enemyRace]} units. Use the{" "}
            <button onClick={() => setCompositionMode(true)} className="text-amber-600 hover:text-amber-400 underline">
              Enemy Composition Picker
            </button>{" "}
            above to specify exactly what they&apos;re running.
          </p>
        )}

        {recommended.length > 0 && (
          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold text-green-500">✓ Recommended ({recommended.length})</h4>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {recommended.map((score, idx) => (
                <UnitCard key={score.unit.id} score={score} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {situational.length > 0 && (
          <details className="group mb-3">
            <summary className="cursor-pointer text-sm font-bold text-orange-500 mb-3 list-none flex items-center gap-2 hover:text-orange-400">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Situational ({situational.length})
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {situational.map((score) => (
                <UnitCard key={score.unit.id} score={score} />
              ))}
            </div>
          </details>
        )}

        {avoid.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-bold text-red-600 mb-3 list-none flex items-center gap-2 hover:text-red-500">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Avoid ({avoid.length})
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {avoid.map((score) => (
                <UnitCard key={score.unit.id} score={score} />
              ))}
            </div>
          </details>
        )}
      </section>

      {/* === HERO RECOMMENDATIONS === */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-xl font-bold text-amber-400">👑 Hero Recommendations</h3>
          {isCustomMode && (
            <span className="rounded-full bg-amber-900/40 border border-amber-700 px-2 py-0.5 text-xs text-amber-400">
              Custom composition
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {activeHeroScores.map((score, idx) => (
            <HeroCard key={score.hero.id} score={score} rank={idx + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- Composition Insights: key tactical callouts ----

function CompositionInsights({ selectedUnits, selectedHeroes }: { selectedUnits: Unit[]; selectedHeroes: Hero[] }) {
  const insights: { icon: string; text: string; type: "tip" | "warning" }[] = [];

  const hasPaladin = selectedHeroes.some((h) => h.id === "paladin");
  const hasArchmage = selectedHeroes.some((h) => h.id === "archmage");
  const hasMK = selectedHeroes.some((h) => h.id === "mountain_king");
  const hasBloodMage = selectedHeroes.some((h) => h.id === "blood_mage");
  const hasRifles = selectedUnits.some((u) => u.id === "rifleman");
  const hasSorceress = selectedUnits.some((u) => u.id === "sorceress");
  const hasPriest = selectedUnits.some((u) => u.id === "priest");
  const hasKnights = selectedUnits.some((u) => u.id === "knight");
  const hasGryphons = selectedUnits.some((u) => u.id === "gryphon_rider");
  const hasSpellBreaker = selectedUnits.some((u) => u.id === "spell_breaker");
  const hasMortarTeam = selectedUnits.some((u) => u.id === "mortar_team");

  // Human-specific
  if (hasPaladin) {
    insights.push({ icon: "⚠️", text: "Paladin Holy Light heals for 400–600 HP — you need burst damage to outpace his healing. Shadow Hunter Hex shuts him down completely.", type: "warning" });
    insights.push({ icon: "💡", text: "Shaman Purge removes Devotion Aura armor buff from enemy units temporarily.", type: "tip" });
  }
  if (hasArchmage) {
    insights.push({ icon: "⚠️", text: "Archmage Brilliance Aura keeps all enemy casters at full mana — pressure their mana pool indirectly by killing casters fast.", type: "warning" });
    insights.push({ icon: "💡", text: "Mass Teleport lets them escape losing fights instantly — always have vision of their army.", type: "warning" });
  }
  if (hasMK) {
    insights.push({ icon: "⚠️", text: "Storm Bolt stuns your hero for 2–4 seconds — spread heroes apart to avoid chain stuns.", type: "warning" });
    insights.push({ icon: "💡", text: "Avatar makes MK spell-immune — don't waste Hex or Purge while Avatar is active.", type: "tip" });
  }
  if (hasBloodMage) {
    insights.push({ icon: "⚠️", text: "Banish + Gryphon Rider = massive magic burst on any unit. Spread your heavy-armored units.", type: "warning" });
  }
  if (hasRifles) {
    insights.push({ icon: "💡", text: `Rifles use Piercing attack vs Light armor = 200% damage. Your Headhunters (also Piercing) deal 200% back to Rifles (Light armor) — mass Headhunters hard-counter mass Rifles.`, type: "tip" });
  }
  if (hasSorceress) {
    insights.push({ icon: "⚠️", text: "Sorceress Slow reduces your attack AND movement speed by 50% — kills your Bloodlust effectiveness. Shaman Purge removes Slow immediately.", type: "warning" });
  }
  if (hasPriest) {
    insights.push({ icon: "⚠️", text: "Priest Heal sustains the Human frontline. Resurrection can revive up to 6 units — kill the Priest early.", type: "warning" });
  }
  if (hasKnights) {
    insights.push({ icon: "💡", text: "Knights have Heavy armor — Shaman/Spirit Walker magic attacks deal 200% vs Heavy armor. Avoid Normal attack units as frontline counters.", type: "tip" });
  }
  if (hasGryphons) {
    insights.push({ icon: "⚠️", text: "Gryphon Riders have magic attack (200% vs Heavy armor — your Grunts/Taurens). Raider Ensnare grounds them — priority.", type: "warning" });
    insights.push({ icon: "💡", text: "Wyvern Riders counter Gryphons in air battles. Headhunters also deal good anti-air damage.", type: "tip" });
  }
  if (hasSpellBreaker) {
    insights.push({ icon: "⚠️", text: "Spell Breakers drain mana from your Shamans/Witch Doctors and dispel Bloodlust. Keep casters away from Spell Breakers.", type: "warning" });
  }
  if (hasMortarTeam) {
    insights.push({ icon: "⚠️", text: "Mortar Teams deal siege splash damage — clump your army less. Mortar Teams are fragile in melee — rush them with Grunts.", type: "warning" });
  }

  if (insights.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-2 rounded px-2 py-1.5 text-xs",
            insight.type === "warning" ? "bg-red-950/40 text-red-300" : "bg-green-950/40 text-green-300"
          )}
        >
          <span className="flex-shrink-0 mt-0.5">{insight.icon}</span>
          {insight.text}
        </div>
      ))}
    </div>
  );
}
