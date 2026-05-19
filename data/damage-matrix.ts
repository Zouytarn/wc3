export type AttackType =
  | "normal"
  | "piercing"
  | "siege"
  | "magic"
  | "chaos"
  | "hero"
  | "spells";

export type ArmorType =
  | "unarmored"
  | "light"
  | "medium"
  | "heavy"
  | "fortified"
  | "hero";

// Damage multiplier matrix: attackType → armorType → multiplier
// Source: Warcraft III: Reforged game data
export const DAMAGE_MATRIX: Record<AttackType, Record<ArmorType, number>> = {
  piercing:  { unarmored: 1.50, light: 2.00, medium: 0.75, heavy: 1.00, fortified: 0.35, hero: 0.50 },
  normal:    { unarmored: 1.00, light: 1.00, medium: 1.50, heavy: 1.00, fortified: 0.70, hero: 1.00 },
  siege:     { unarmored: 1.50, light: 1.00, medium: 0.50, heavy: 1.00, fortified: 1.50, hero: 0.50 },
  magic:     { unarmored: 1.00, light: 1.25, medium: 0.75, heavy: 2.00, fortified: 0.35, hero: 0.50 },
  chaos:     { unarmored: 1.00, light: 1.00, medium: 1.00, heavy: 1.00, fortified: 1.00, hero: 1.00 },
  hero:      { unarmored: 1.00, light: 1.00, medium: 1.00, heavy: 1.00, fortified: 0.50, hero: 1.00 },
  spells:    { unarmored: 1.00, light: 1.00, medium: 1.00, heavy: 1.00, fortified: 1.00, hero: 0.70 },
};

export const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  piercing: "Piercing",
  normal:   "Normal",
  siege:    "Siege",
  magic:    "Magic",
  chaos:    "Chaos",
  hero:     "Hero",
  spells:   "Spells",
};

export const ARMOR_TYPE_LABELS: Record<ArmorType, string> = {
  unarmored: "Unarmored",
  light:     "Light",
  medium:    "Medium",
  heavy:     "Heavy",
  fortified: "Fortified",
  hero:      "Hero",
};

export const ATTACK_TYPE_DESCRIPTIONS: Record<AttackType, string> = {
  piercing: "Ranged units – archers, riflemen, grunts with ranged. Devastating vs light armor.",
  normal:   "Most melee units – footmen, grunts, etc. Strong vs medium armor.",
  siege:    "Catapults, cannons, demolishers. Excellent vs buildings (fortified).",
  magic:    "Casters and magic-based attacks. Devastating vs heavy armor.",
  chaos:    "Full damage to all armor types. Rare and very powerful.",
  hero:     "Hero basic attacks. Solid all-around with only fortified penalty.",
  spells:   "Spells and abilities. Consistent damage across all armor types.",
};

export const ARMOR_TYPE_DESCRIPTIONS: Record<ArmorType, string> = {
  unarmored: "Buildings under construction, some critters. Vulnerable to piercing and siege.",
  light:     "Most ranged units and fast skirmishers. Very vulnerable to piercing.",
  medium:    "Melee infantry. Vulnerable to normal damage.",
  heavy:     "Heavily armored melee units. Vulnerable to magic damage.",
  fortified: "Buildings and siege engines. Resistant to most attack types.",
  hero:      "Hero units. Generally resistant, vulnerable to chaos and heavy physical.",
};

export function getEffectivenessColor(multiplier: number): string {
  if (multiplier >= 1.5)  return "bg-green-600 text-white";
  if (multiplier >= 1.25) return "bg-green-500/80 text-white";
  if (multiplier >= 1.0)  return "bg-yellow-600/80 text-white";
  if (multiplier >= 0.75) return "bg-orange-600/80 text-white";
  return "bg-red-700 text-white";
}

export function getEffectivenessLabel(multiplier: number): string {
  if (multiplier >= 1.5)  return "Devastating";
  if (multiplier >= 1.25) return "Strong";
  if (multiplier >= 1.0)  return "Normal";
  if (multiplier >= 0.75) return "Weak";
  return "Ineffective";
}
