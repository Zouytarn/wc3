import { DAMAGE_MATRIX, getEffectivenessLabel } from "@/data/damage-matrix";
import { UNITS_BY_RACE, type Unit, type Race } from "@/data/units";
import { HEROES_BY_RACE, type Hero } from "@/data/heroes";

export interface UnitMatchupScore {
  unit: Unit;
  offensiveScore: number;   // how effectively this unit attacks enemy units (avg multiplier)
  defensiveScore: number;   // how resistant this unit is to enemy attacks (inverse of enemy multiplier)
  overallScore: number;     // weighted combination
  effectivenessVsEnemyUnits: {
    enemyUnit: Unit;
    multiplier: number;
    label: string;
  }[];
  explanation: string;
  recommendation: "highly_recommended" | "recommended" | "situational" | "avoid";
}

export interface HeroMatchupScore {
  hero: Hero;
  relevanceScore: number;
  strongPoints: string[];
  weakPoints: string[];
  recommendation: "primary" | "secondary" | "situational";
}

export interface MatchupResult {
  myRace: Race;
  enemyRace: Race;
  unitScores: UnitMatchupScore[];
  heroScores: HeroMatchupScore[];
  topUnits: Unit[];
  topHeroes: Hero[];
  generalAnalysis: string;
  keyThreats: string[];
  keyAdvantages: string[];
}

// Compute how well a unit attacks the enemy army (offensive effectiveness)
function computeOffensiveScore(unit: Unit, enemyUnits: Unit[]): {
  score: number;
  details: { enemyUnit: Unit; multiplier: number; label: string }[];
} {
  if (enemyUnits.length === 0) return { score: 1.0, details: [] };

  const details = enemyUnits.map((enemy) => {
    const multiplier = DAMAGE_MATRIX[unit.attackType][enemy.armorType];
    return {
      enemyUnit: enemy,
      multiplier,
      label: getEffectivenessLabel(multiplier),
    };
  });

  const score = details.reduce((sum, d) => sum + d.multiplier, 0) / details.length;
  return { score, details };
}

// Compute how well a unit resists enemy attacks (defensive score)
// A unit is more resistant if enemies do less damage to it
function computeDefensiveScore(unit: Unit, enemyUnits: Unit[]): number {
  if (enemyUnits.length === 0) return 1.0;

  // Average damage enemy units deal to this unit — lower is better for defense
  const avgEnemyDamage =
    enemyUnits.reduce((sum, enemy) => {
      const multiplier = DAMAGE_MATRIX[enemy.attackType][unit.armorType];
      return sum + multiplier;
    }, 0) / enemyUnits.length;

  // Invert so a higher score = more defensive
  return 1 / avgEnemyDamage;
}

function buildExplanation(unit: Unit, offensiveScore: number, details: { enemyUnit: Unit; multiplier: number; label: string }[]): string {
  const strongVs = details.filter((d) => d.multiplier >= 1.25).map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);
  const weakVs = details.filter((d) => d.multiplier < 0.75).map((d) => `${d.enemyUnit.name} (${Math.round(d.multiplier * 100)}%)`);

  let explanation = `${unit.name} uses ${unit.attackType} attack vs ${unit.armorType} armor. `;

  if (strongVs.length > 0) {
    explanation += `Deals bonus damage to: ${strongVs.join(", ")}. `;
  }
  if (weakVs.length > 0) {
    explanation += `Reduced effectiveness vs: ${weakVs.join(", ")}. `;
  }
  if (strongVs.length === 0 && weakVs.length === 0) {
    explanation += "Deals consistent normal damage across all enemy unit types.";
  }

  return explanation.trim();
}

function getRecommendation(overallScore: number): UnitMatchupScore["recommendation"] {
  if (overallScore >= 1.3) return "highly_recommended";
  if (overallScore >= 1.05) return "recommended";
  if (overallScore >= 0.85) return "situational";
  return "avoid";
}

function scoreHero(hero: Hero, enemyRace: Race, enemyUnits: Unit[]): HeroMatchupScore {
  const strongPoints: string[] = [];
  const weakPoints: string[] = [];
  let relevanceScore = 1.0;

  // Hero offensive effectiveness against enemy army (hero attack type)
  const avgDamageMultiplier =
    enemyUnits.length > 0
      ? enemyUnits.reduce((sum, u) => sum + DAMAGE_MATRIX[hero.attackType][u.armorType], 0) / enemyUnits.length
      : 1.0;

  relevanceScore *= avgDamageMultiplier;

  // Bonus for heroes explicitly strong vs enemy race
  if (hero.strongVs.includes(enemyRace)) {
    relevanceScore += 0.3;
    strongPoints.push(`Generally strong in this matchup (${enemyRace} race)`);
  }

  // Analyze abilities for matchup relevance
  for (const ability of hero.abilities) {
    const name = ability.name.toLowerCase();
    const desc = ability.description.toLowerCase();

    if (ability.type === "aura") {
      strongPoints.push(`${ability.name}: ${ability.description.slice(0, 80)}...`);
      relevanceScore += 0.2;
    }

    if (desc.includes("mana") && enemyRace === "human") {
      strongPoints.push(`${ability.name} targets mana — disrupts Human caster army`);
      relevanceScore += 0.15;
    }

    if ((desc.includes("heal") || desc.includes("resurrect")) && enemyRace === "undead") {
      strongPoints.push(`${ability.name} heals/resurrects — extra effective vs Undead attrition`);
      relevanceScore += 0.1;
    }

    if (desc.includes("undead") && enemyRace === "undead") {
      strongPoints.push(`${ability.name} has special interaction with Undead units`);
      relevanceScore += 0.2;
    }

    if (desc.includes("stun") || desc.includes("root") || desc.includes("sleep") || desc.includes("hex")) {
      strongPoints.push(`${ability.name} provides crowd control — universally valuable`);
      relevanceScore += 0.1;
    }

    if (desc.includes("dispel") || name.includes("abolish") || name.includes("dispel")) {
      if (enemyRace === "orc" || enemyRace === "human") {
        strongPoints.push(`${ability.name} dispels enemy buffs — counters Bloodlust/Slow`);
        relevanceScore += 0.15;
      }
    }
  }

  // Weaknesses
  if (hero.role === "int" && hero.primaryStat === "intelligence") {
    weakPoints.push("Fragile — keep behind frontline. Dies fast if focused.");
  }
  if (hero.range === "melee" && enemyRace === "nightelf") {
    weakPoints.push("Melee hero — vulnerable to Entangle roots from Keeper of the Grove.");
  }

  const recommendation: HeroMatchupScore["recommendation"] =
    relevanceScore >= 1.5 ? "primary" : relevanceScore >= 1.1 ? "secondary" : "situational";

  return {
    hero,
    relevanceScore,
    strongPoints,
    weakPoints,
    recommendation,
  };
}

export function computeMatchup(myRace: Race, enemyRace: Race): MatchupResult {
  const myUnits = UNITS_BY_RACE[myRace];
  const enemyUnits = UNITS_BY_RACE[enemyRace];
  const myHeroes = HEROES_BY_RACE[myRace];

  // Score all my units against enemy army
  const unitScores: UnitMatchupScore[] = myUnits.map((unit) => {
    const { score: offensiveScore, details } = computeOffensiveScore(unit, enemyUnits);
    const defensiveScore = computeDefensiveScore(unit, enemyUnits);

    // Weighted: offense matters more (0.65) than defense (0.35)
    const overallScore = offensiveScore * 0.65 + defensiveScore * 0.35;

    return {
      unit,
      offensiveScore,
      defensiveScore,
      overallScore,
      effectivenessVsEnemyUnits: details,
      explanation: buildExplanation(unit, offensiveScore, details),
      recommendation: getRecommendation(overallScore),
    };
  });

  // Sort by overall score descending
  unitScores.sort((a, b) => b.overallScore - a.overallScore);

  // Score heroes
  const heroScores: HeroMatchupScore[] = myHeroes.map((hero) =>
    scoreHero(hero, enemyRace, enemyUnits)
  );
  heroScores.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const topUnits = unitScores
    .filter((s) => s.recommendation !== "avoid")
    .slice(0, 5)
    .map((s) => s.unit);

  const topHeroes = heroScores.slice(0, 2).map((s) => s.hero);

  // Build general analysis
  const keyThreats = enemyUnits
    .filter((u) => {
      // Enemy units that have high damage against our typical army
      const avgDmgToUs = myUnits.reduce((sum, mine) => {
        return sum + DAMAGE_MATRIX[u.attackType][mine.armorType];
      }, 0) / myUnits.length;
      return avgDmgToUs >= 1.2;
    })
    .map((u) => `${u.name} (${u.attackType} attack threatens your units)`);

  const keyAdvantages = unitScores
    .filter((s) => s.recommendation === "highly_recommended")
    .map((s) => `${s.unit.name}: ${s.explanation.slice(0, 80)}...`);

  const generalAnalysis = `As ${myRace.charAt(0).toUpperCase() + myRace.slice(1)} vs ${enemyRace.charAt(0).toUpperCase() + enemyRace.slice(1)}: Focus on your top-recommended units for maximum damage efficiency. Your heroes should support your core army composition while countering enemy strengths.`;

  return {
    myRace,
    enemyRace,
    unitScores,
    heroScores,
    topUnits,
    topHeroes,
    generalAnalysis,
    keyThreats: keyThreats.slice(0, 3),
    keyAdvantages: keyAdvantages.slice(0, 3),
  };
}

// Utility: get effectiveness color class for a percentage score (as fraction)
export function getScoreColor(score: number): string {
  if (score >= 1.3)  return "text-green-400";
  if (score >= 1.05) return "text-yellow-400";
  if (score >= 0.85) return "text-orange-400";
  return "text-red-400";
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 1.3)  return "bg-green-900/50 text-green-400 border-green-700";
  if (score >= 1.05) return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
  if (score >= 0.85) return "bg-orange-900/50 text-orange-400 border-orange-700";
  return "bg-red-900/50 text-red-400 border-red-700";
}

export function getRecommendationLabel(rec: UnitMatchupScore["recommendation"]): string {
  const labels: Record<UnitMatchupScore["recommendation"], string> = {
    highly_recommended: "★ Highly Recommended",
    recommended: "✓ Recommended",
    situational: "~ Situational",
    avoid: "✗ Avoid",
  };
  return labels[rec];
}

export function getRecommendationColor(rec: UnitMatchupScore["recommendation"]): string {
  const colors: Record<UnitMatchupScore["recommendation"], string> = {
    highly_recommended: "text-green-400",
    recommended: "text-yellow-400",
    situational: "text-orange-400",
    avoid: "text-red-400",
  };
  return colors[rec];
}
