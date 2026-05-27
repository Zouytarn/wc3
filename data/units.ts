import type { AttackType, ArmorType } from "./damage-matrix";
import liquipediaData from "./units-liquipedia.json";
import gameplayData from "./units-gameplay.json";

export type Race = "human" | "orc" | "nightelf" | "undead";
export type UnitRole = "frontline" | "ranged" | "support" | "siege" | "caster" | "flying";
export type UnitTier = 1 | 2 | 3;

export interface UnitAbilityField {
  label: string;
  value: string;
}

export interface UnitResearchCost {
  gold?: number;
  lumber?: number;
  time?: number;
}

export interface UnitAbility {
  kind: "ability";
  name: string;
  iconKey?: string;
  castType?: string;
  targetType?: string;
  description: string;
  hotkey?: string;
  fields: UnitAbilityField[];
  researchedAt?: string;
  researchCost?: UnitResearchCost;
}

export interface UnitUpgradeLevel {
  name: string;
  iconKey?: string;
  gold?: number;
  lumber?: number;
  researchTime?: number;
  requires?: string;
  effects: UnitAbilityField[];
}

export interface UnitUpgrade {
  kind: "upgrade";
  name: string;
  iconKey?: string;
  description: string;
  hotkey?: string;
  researchedAt?: string;
  levels: UnitUpgradeLevel[];
}

export interface Unit {
  id: string;
  name: string;
  race: Race;
  role: UnitRole;
  tier: UnitTier;
  attackType: AttackType;
  armorType: ArmorType;
  goldCost: number;
  lumberCost: number;
  buildTime?: number;
  foodCost: number;
  hp: number;
  hpRegen?: string;
  armor: number;
  armorUpgraded?: number;
  level?: number;
  daySight?: number;
  nightSight?: number;
  speed: number;
  speedUpgraded?: number;
  turnRate?: number;
  moveType?: string;
  damageMin: number;
  damageMax: number;
  damageUpgradedMin?: number;
  damageUpgradedMax?: number;
  /** Legacy display string — avg base damage */
  damage: string;
  dps: number;
  dpsUpgraded?: number;
  cooldown: number;
  cooldownUpgraded?: number;
  range: number | string;
  weaponType?: string;
  targets?: string[];
  builtFrom?: string;
  requires?: string;
  lore?: string;
  abilities: UnitAbility[];
  upgrades: UnitUpgrade[];
  /** Strategy overlay — not from Liquipedia */
  special: string[];
  counters: string[];
  weakTo: string[];
  description: string;
}

type GameplayOverlay = {
  role: UnitRole;
  tier: UnitTier;
  counters: string[];
  weakTo: string[];
};

type LiquipediaUnit = Omit<
  Unit,
  "role" | "tier" | "special" | "counters" | "weakTo" | "description" | "damage"
> & {
  attackType: string;
  armorType: string;
};

function buildUnit(raw: LiquipediaUnit): Unit {
  const overlay = (gameplayData as Record<string, GameplayOverlay>)[raw.id];
  const avgDmg = (raw.damageMin + raw.damageMax) / 2;

  const abilityLabels = raw.abilities
    .filter((a) => a.name !== "Gather" && !a.name.startsWith("Unit Inventory"))
    .map((a) => a.name);

  return {
    ...raw,
    attackType: raw.attackType as AttackType,
    armorType: raw.armorType as ArmorType,
    role: overlay?.role ?? "frontline",
    tier: overlay?.tier ?? 1,
    counters: overlay?.counters ?? [],
    weakTo: overlay?.weakTo ?? [],
    damage: avgDmg % 1 === 0 ? String(avgDmg) : avgDmg.toFixed(1),
    speed: raw.speed,
    special: abilityLabels,
    description: raw.lore ?? "",
    abilities: raw.abilities as UnitAbility[],
    upgrades: raw.upgrades as UnitUpgrade[],
  };
}

const mergedUnits = (liquipediaData.units as LiquipediaUnit[]).map(buildUnit);

export const ALL_UNITS: Unit[] = mergedUnits;

export const UNITS_BY_RACE: Record<Race, Unit[]> = {
  human:    mergedUnits.filter((u) => u.race === "human"),
  orc:      mergedUnits.filter((u) => u.race === "orc"),
  nightelf: mergedUnits.filter((u) => u.race === "nightelf"),
  undead:   mergedUnits.filter((u) => u.race === "undead"),
};

export const RACE_LABELS: Record<Race, string> = {
  human:    "Human",
  orc:      "Orc",
  nightelf: "Night Elf",
  undead:   "Undead",
};

export const RACE_COLORS: Record<Race, string> = {
  human:    "from-blue-900 to-blue-700",
  orc:      "from-red-900 to-red-700",
  nightelf: "from-purple-900 to-purple-700",
  undead:   "from-gray-900 to-gray-700",
};

export const RACE_ACCENT: Record<Race, string> = {
  human:    "text-blue-400 border-blue-600",
  orc:      "text-red-400 border-red-600",
  nightelf: "text-purple-400 border-purple-600",
  undead:   "text-gray-400 border-gray-600",
};

export const RACE_DESCRIPTIONS: Record<Race, string> = {
  human:    "Versatile army with powerful casters and ranged. Knights provide durable frontline, Sorceresses control the battlefield with Slow and Polymorph.",
  orc:      "High HP melee powerhouse. Bloodlust stacks with Grunt and Tauren for overwhelming physical pressure. Ensnare grounds all flying units.",
  nightelf: "Mobile and adaptive. Dryads hard-counter magic armies, Chimaeras dominate late-game, Mountain Giant tanks with Taunt.",
  undead:   "Attrition army using summons and disease. Necromancers flood the map with skeletons, Banshees steal units, Frost Wyrms siege late.",
};

/** Liquipedia sync metadata — for attribution footer */
export const UNITS_DATA_SOURCE = {
  url: liquipediaData.source,
  license: liquipediaData.license,
  syncedAt: liquipediaData.syncedAt,
};

/** Format damage range like Liquipedia: "12 - 14 (15 - 20)" */
export function formatDamage(unit: Unit): string {
  const base = `${unit.damageMin} - ${unit.damageMax}`;
  if (unit.damageUpgradedMin != null && unit.damageUpgradedMax != null) {
    return `${base} (${unit.damageUpgradedMin} - ${unit.damageUpgradedMax})`;
  }
  return base;
}

/** Format speed like Liquipedia: "270 (330)" */
export function formatSpeed(unit: Unit): string {
  if (unit.speedUpgraded) return `${unit.speed} (${unit.speedUpgraded})`;
  return String(unit.speed);
}

/** Format armor like Liquipedia: "0 (6)" */
export function formatArmor(unit: Unit): string {
  if (unit.armorUpgraded != null) return `${unit.armor} (${unit.armorUpgraded})`;
  return String(unit.armor);
}

/** Format cooldown like Liquipedia: "1.35 (1)" */
export function formatCooldown(unit: Unit): string {
  if (unit.cooldownUpgraded) return `${unit.cooldown} (${unit.cooldownUpgraded})`;
  return String(unit.cooldown);
}

/** Classify movement speed label from numeric value */
export function speedLabel(speed: number): string {
  if (speed >= 350) return "Fast";
  if (speed >= 270) return "Average";
  if (speed >= 220) return "Slow";
  return "Very Slow";
}
