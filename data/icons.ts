// Maps unit/hero IDs to their classic (original WC3) icon filenames in /public/icons/
// Naming convention: BTN<Name>.png

const BASE = "/icons/";

export const UNIT_ICONS: Record<string, string> = {
  // Human units
  militia:        BASE + "BTNMilitia.png",
  footman:        BASE + "BTNFootman.png",
  rifleman:       BASE + "BTNRifleman.png",
  knight:         BASE + "BTNKnight.png",
  sorceress:      BASE + "BTNSorceress.png",
  priest:         BASE + "BTNPriest.png",
  spell_breaker:  BASE + "BTNSpellBreaker.png",
  mortar_team:    BASE + "BTNMortarTeam.png",
  flying_machine: BASE + "BTNFlyingMachine.png",
  gryphon_rider:  BASE + "BTNGryphonRider.png",
  dragon_hawk:    BASE + "BTNDragonHawk.png",

  // Orc units
  grunt:         BASE + "BTNGrunt.png",
  headhunter:    BASE + "BTNHeadhunter.png",
  shaman:        BASE + "BTNShaman.png",
  witch_doctor:  BASE + "BTNWitchDoctor.png",
  raider:        BASE + "BTNRaider.png",
  catapult:      BASE + "BTNDemolisher.png",
  kodo_beast:    BASE + "BTNRiderlessKodo.png",
  spirit_walker: BASE + "BTNSpiritWalker.png",
  tauren:        BASE + "BTNTauren.png",
  wind_rider:    BASE + "BTNWyvern.png",
  batrider:      BASE + "BTNTrollBatRider.png",

  // Night Elf units
  wisp:               BASE + "BTNWisp.png",
  archer:             BASE + "BTNArcher.png",
  huntress:           BASE + "BTNHuntress.png",
  dryad:              BASE + "BTNDryad.png",
  druid_of_the_talon: BASE + "BTNDruidOfTheTalon.png",
  druid_of_the_claw:  BASE + "BTNDruidOfTheClaw.png",
  mountain_giant:     BASE + "BTNMountainGiant.png",
  hippogryph:         BASE + "BTNHippogriffRider.png",
  faerie_dragon:      BASE + "BTNFaerieDragon.png",
  chimaera:           BASE + "BTNChimaera.png",
  glaive_thrower:     BASE + "BTNGlaiveThrower.png",

  // Undead units
  ghoul:           BASE + "BTNGhoul.png",
  crypt_fiend:     BASE + "BTNCryptFiend.png",
  necromancer:     BASE + "BTNNecromancer.png",
  banshee:         BASE + "BTNBanshee.png",
  abomination:     BASE + "BTNAbomination.png",
  gargoyle:        BASE + "BTNGargoyle.png",
  shade:           BASE + "BTNShade.png",
  meat_wagon:      BASE + "BTNMeatWagon.png",
  obsidian_statue: BASE + "BTNObsidianStatue.png",
  frost_wyrm:      BASE + "BTNFrostWyrm.png",
  destroyer:       BASE + "BTNDestroyer.png",
};

export const HERO_ICONS: Record<string, string> = {
  // Human heroes
  archmage:       BASE + "BTNHeroArchMage.png",
  paladin:        BASE + "BTNHeroPaladin.png",
  mountain_king:  BASE + "BTNHeroMountainKing.png",
  blood_mage:     BASE + "BTNBloodMage2.png",

  // Orc heroes
  blademaster:      BASE + "BTNHeroBlademaster.png",
  far_seer:         BASE + "BTNHeroFarseer.png",
  tauren_chieftain: BASE + "BTNHeroTaurenChieftain.png",
  shadow_hunter:    BASE + "BTNShadowHunter.png",

  // Night Elf heroes
  demon_hunter:          BASE + "BTNHeroDemonHunter.png",
  keeper_of_the_grove:   BASE + "BTNKeeperOfTheGrove.png",
  priestess_of_the_moon: BASE + "BTNPriestessOfTheMoon.png",
  warden:                BASE + "BTNHeroWarden.png",

  // Undead heroes
  death_knight: BASE + "BTNHeroDeathKnight.png",
  lich:         BASE + "BTNHeroLich.png",
  dread_lord:   BASE + "BTNHeroDreadLord.png",
  crypt_lord:   BASE + "BTNHeroCryptLord.png",
};

export function getUnitIcon(id: string): string {
  return UNIT_ICONS[id] ?? "/icons/BTNFootman.png";
}

export function getHeroIcon(id: string): string {
  return HERO_ICONS[id] ?? "/icons/BTNHeroPaladin.png";
}

/**
 * Returns the icon path for a build step's iconKey.
 * Looks up in both UNIT_ICONS and HERO_ICONS.
 * Returns undefined if no icon is found (caller should fall back to emoji).
 */
export function getBuildStepIcon(iconKey: string): string | undefined {
  return UNIT_ICONS[iconKey] ?? HERO_ICONS[iconKey] ?? undefined;
}

// Race faction icons — official Reforged faction art
export const RACE_ICONS: Record<string, string> = {
  human:    "/race-icons/Warcraft_III_Reforged_-_Humans_Icon.png",
  orc:      "/race-icons/Warcraft_III_Reforged_-_Orcs_Icon.png",
  nightelf: "/race-icons/Warcraft_III_Reforged_-_Night_Elves_Icon.png",
  undead:   "/race-icons/Warcraft_III_Reforged_-_Undead_Icon.png",
};
