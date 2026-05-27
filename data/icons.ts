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
  dragon_hawk:    BASE + "BTNDragonHawkRider.png",

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
  wind_rider:    BASE + "BTNWyvernRider.png",
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

// Building, tech, research, and worker icons for the Build Order timeline
export const BUILDING_ICONS: Record<string, string> = {
  // Workers
  peon:    BASE + "BTNPeon.png",
  peasant: BASE + "BTNPeasant.png",
  acolyte: BASE + "BTNAcolyte.png",

  // Human buildings
  farm:            BASE + "BTNFarm.png",
  barracks:        BASE + "BTNBarracks.png",
  human_barracks:  BASE + "BTNHumanBarracks.png",
  blacksmith:      BASE + "BTNBlacksmith.png",
  lumber_mill:     BASE + "BTNHumanLumberMill.png",
  arcane_sanctum:  BASE + "BTNArcaneSanctum.png",
  workshop:        BASE + "BTNWorkshop.png",
  gryphon_aviary:  BASE + "BTNGryphonAviary.png",
  altar_of_kings:  BASE + "BTNAltarOfKings.png",
  keep:            BASE + "BTNKeep.png",
  castle:          BASE + "BTNCastle.png",
  town_hall:       BASE + "BTNTownHall.png",

  // Orc buildings
  war_mill:      BASE + "BTNOrcLumberUpgradeTwo.png",
  burrow:        BASE + "BTNTrollBurrow.png",
  great_hall:    BASE + "BTNGreatHall.png",
  stronghold:    BASE + "BTNStrongHold.png",
  fortress:      BASE + "BTNFortress.png",
  voodoo_lounge: BASE + "BTNVoodooLounge.png",
  spirit_lodge:  BASE + "BTNSpiritLodge.png",
  beastiary:     BASE + "BTNBeastiary.png",
  tauren_totem:  BASE + "BTNTaurenTotem.png",
  altar_of_storms: BASE + "BTNAltarOfStorms.png",

  // Night Elf buildings
  moon_well:       BASE + "BTNMoonWell.png",
  ancient_of_war:  BASE + "BTNAncientOfTheEarth.png",
  ancient_of_lore: BASE + "BTNAncientOfLore.png",
  ancient_of_wind: BASE + "BTNAncientOfWonders.png",
  hunters_hall:    BASE + "BTNHuntersHall.png",
  elven_farm:      BASE + "BTNElvenFarm.png",
  tree_of_life:    BASE + "BTNTreeOfLife.png",
  tree_of_ages:    BASE + "BTNTreeOfAges.png",
  tree_of_eternity: BASE + "BTNTreeOfEternity.png",
  altar_of_elders: BASE + "BTNAltarOfElders.png",

  // Undead buildings
  crypt:               BASE + "BTNCrypt.png",
  necropolis:          BASE + "BTNNecropolis.png",
  graveyard:           BASE + "BTNGraveYard.png",
  haunted_mine:        BASE + "BTNHauntedMine.png",
  slaughterhouse:      BASE + "BTNSlaughterHouse.png",
  temple_of_the_damned: BASE + "BTNTempleOfTheDamned.png",
  ziggurat:            BASE + "BTNZiggurat.png",
  spirit_tower:        BASE + "BTNZigguratUpgrade.png",
  hall_of_the_dead:    BASE + "BTNHallOfTheDead.png",
  altar_of_darkness:   BASE + "BTNAltarOfDarkness.png",
  tavern:              BASE + "BTNTavern.png",

  // Research upgrades
  defend:           BASE + "BTNDefend.png",
  bloodlust:        BASE + "BTNBloodLust.png",
  berserker_upgrade: BASE + "BTNBerserkForTrolls.png",
  purge:            BASE + "BTNPurge.png",
  flak_cannons:     BASE + "BTNFlakCannons.png",
  long_rifle:       BASE + "BTNDwarvenLongRifle.png",
  storm_hammers:    BASE + "BTNStormHammer.png",
  corrosive_breath: BASE + "BTNCorrosiveBreath.png",
};

// ── Race metadata ──────────────────────────────────────────────────────────

export type IconRace = "human" | "orc" | "nightelf" | "undead" | "neutral";

/**
 * Maps every icon key to its race affiliation.
 * "neutral" = available to all / race-agnostic (workers, research, tavern).
 */
export const ICON_RACES: Record<string, IconRace> = {
  // Workers (neutral — each race has their own but appear in every build)
  peon: "neutral", peasant: "neutral", acolyte: "neutral",

  // Human buildings
  farm: "human", human_barracks: "human",
  blacksmith: "human", lumber_mill: "human", arcane_sanctum: "human",
  workshop: "human", gryphon_aviary: "human", altar_of_kings: "human",
  keep: "human", castle: "human", town_hall: "human",

  // Human units
  militia: "human", footman: "human", rifleman: "human", knight: "human",
  sorceress: "human", priest: "human", spell_breaker: "human",
  mortar_team: "human", flying_machine: "human", gryphon_rider: "human",
  dragon_hawk: "human",

  // Human heroes
  archmage: "human", paladin: "human", mountain_king: "human", blood_mage: "human",

  // Orc buildings
  barracks: "orc", war_mill: "orc",
  burrow: "orc", great_hall: "orc", stronghold: "orc", fortress: "orc",
  voodoo_lounge: "orc", spirit_lodge: "orc", beastiary: "orc",
  tauren_totem: "orc", altar_of_storms: "orc",

  // Orc units
  grunt: "orc", headhunter: "orc", shaman: "orc", witch_doctor: "orc",
  raider: "orc", catapult: "orc", kodo_beast: "orc", spirit_walker: "orc",
  tauren: "orc", wind_rider: "orc", batrider: "orc",

  // Orc heroes
  blademaster: "orc", far_seer: "orc", tauren_chieftain: "orc", shadow_hunter: "orc",

  // Night Elf buildings
  moon_well: "nightelf", ancient_of_war: "nightelf", ancient_of_lore: "nightelf",
  ancient_of_wind: "nightelf", hunters_hall: "nightelf", elven_farm: "nightelf",
  tree_of_life: "nightelf", tree_of_ages: "nightelf", tree_of_eternity: "nightelf",
  altar_of_elders: "nightelf",

  // Night Elf units
  wisp: "nightelf", archer: "nightelf", huntress: "nightelf", dryad: "nightelf",
  druid_of_the_talon: "nightelf", druid_of_the_claw: "nightelf",
  mountain_giant: "nightelf", hippogryph: "nightelf", faerie_dragon: "nightelf",
  chimaera: "nightelf", glaive_thrower: "nightelf",

  // Night Elf heroes
  demon_hunter: "nightelf", keeper_of_the_grove: "nightelf",
  priestess_of_the_moon: "nightelf", warden: "nightelf",

  // Undead buildings
  crypt: "undead", necropolis: "undead", graveyard: "undead",
  haunted_mine: "undead", slaughterhouse: "undead",
  temple_of_the_damned: "undead", ziggurat: "undead",
  spirit_tower: "undead", hall_of_the_dead: "undead", altar_of_darkness: "undead",

  // Undead units
  ghoul: "undead", crypt_fiend: "undead", necromancer: "undead",
  banshee: "undead", abomination: "undead", gargoyle: "undead",
  shade: "undead", meat_wagon: "undead", obsidian_statue: "undead",
  frost_wyrm: "undead", destroyer: "undead",

  // Undead heroes
  death_knight: "undead", lich: "undead", dread_lord: "undead", crypt_lord: "undead",

  // Neutral
  tavern: "neutral",
  defend: "neutral", bloodlust: "neutral", berserker_upgrade: "neutral",
  purge: "neutral", flak_cannons: "neutral", long_rifle: "neutral",
  storm_hammers: "neutral", corrosive_breath: "neutral",
};

// ── Canonical display labels ────────────────────────────────────────────────

/** Overrides for keys where the auto-capitalized version isn't ideal */
const LABEL_OVERRIDES: Record<string, string> = {
  human_barracks:        "Barracks",
  ancient_of_war:        "Ancient of War",
  ancient_of_lore:       "Ancient of Lore",
  ancient_of_wind:       "Ancient of Wind",
  altar_of_kings:        "Altar of Kings",
  altar_of_storms:       "Altar of Storms",
  altar_of_elders:       "Altar of Elders",
  altar_of_darkness:     "Altar of Darkness",
  tree_of_life:          "Tree of Life",
  tree_of_ages:          "Tree of Ages",
  tree_of_eternity:      "Tree of Eternity",
  hall_of_the_dead:      "Hall of the Dead",
  temple_of_the_damned:  "Temple of the Damned",
  hunters_hall:          "Hunters' Hall",
  tauren_chieftain:      "Tauren Chieftain",
  keeper_of_the_grove:   "Keeper of the Grove",
  priestess_of_the_moon: "Priestess of the Moon",
  demon_hunter:          "Demon Hunter",
  shadow_hunter:         "Shadow Hunter",
  blood_mage:            "Blood Mage",
  mountain_king:         "Mountain King",
  death_knight:          "Death Knight",
  dread_lord:            "Dread Lord",
  crypt_lord:            "Crypt Lord",
  crypt_fiend:           "Crypt Fiend",
  far_seer:              "Far Seer",
  great_hall:            "Great Hall",
  voodoo_lounge:         "Voodoo Lounge",
  spirit_lodge:          "Spirit Lodge",
  tauren_totem:          "Tauren Totem",
  moon_well:             "Moon Well",
  lumber_mill:           "Lumber Mill",
  arcane_sanctum:        "Arcane Sanctum",
  gryphon_aviary:        "Gryphon Aviary",
  gryphon_rider:         "Gryphon Rider",
  spell_breaker:         "Spell Breaker",
  mortar_team:           "Mortar Team",
  flying_machine:        "Flying Machine",
  dragon_hawk:           "Dragon Hawk",
  spirit_walker:         "Spirit Walker",
  wind_rider:            "Wind Rider",
  kodo_beast:            "Kodo Beast",
  faerie_dragon:         "Faerie Dragon",
  druid_of_the_talon:    "Druid of the Talon",
  druid_of_the_claw:     "Druid of the Claw",
  mountain_giant:        "Mountain Giant",
  glaive_thrower:        "Glaive Thrower",
  haunted_mine:          "Haunted Mine",
  obsidian_statue:       "Obsidian Statue",
  frost_wyrm:            "Frost Wyrm",
  meat_wagon:            "Meat Wagon",
  berserker_upgrade:     "Berserker Upgrade",
  flak_cannons:          "Flak Cannons",
  long_rifle:            "Long Rifle",
  storm_hammers:         "Storm Hammers",
  corrosive_breath:      "Corrosive Breath",
  elven_farm:            "Elven Farm",
  town_hall:             "Town Hall",
};

/** Returns the canonical display label for an icon key, e.g. "altar_of_storms" → "Altar of Storms" */
export function iconKeyToLabel(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── All icons combined ─────────────────────────────────────────────────────

/**
 * All icon keys combined — used for smart suggestion matching.
 * Order matters: BUILDING first so buildings score higher for action text.
 */
const ALL_ICONS: Array<{ key: string; path: string }> = [
  ...Object.entries(BUILDING_ICONS).map(([key, path]) => ({ key, path })),
  ...Object.entries(UNIT_ICONS).map(([key, path]) => ({ key, path })),
  ...Object.entries(HERO_ICONS).map(([key, path]) => ({ key, path })),
];

/** Common shorthand aliases → canonical icon keys */
const ALIASES: Record<string, string[]> = {
  altar:    ["altar_of_kings", "altar_of_storms", "altar_of_elders", "altar_of_darkness"],
  am:       ["archmage"],
  dk:       ["death_knight"],
  tc:       ["tauren_chieftain"],
  bm:       ["blademaster"],
  fs:       ["far_seer"],
  sh:       ["shadow_hunter"],
  dh:       ["demon_hunter"],
  kotg:     ["keeper_of_the_grove"],
  potm:     ["priestess_of_the_moon"],
  dl:       ["dread_lord"],
  gryphon:  ["gryphon_rider"],
  archers:  ["archer"],
  grunts:   ["grunt"],
  barrack:  ["barracks", "human_barracks"],
  warmill:  ["war_mill"],
  mill:     ["war_mill"],
  moonwell: ["moon_well"],
  zigg:     ["ziggurat"],
  hh:       ["headhunter"],
  rax:      ["barracks", "human_barracks"],
  wd:       ["witch_doctor"],
  mk:       ["mountain_king"],
  kael:     ["blood_mage"],
  lich:     ["lich_king"],
  sorc:     ["sorceress"],
  zerker:   ["berserker_upgrade"],
  berserker: ["berserker_upgrade"],
  zerk:     ["berserker_upgrade"],
  headhunters: ["headhunter"],
  ghouls:   ["ghoul"],
  necros:   ["necromancer"],
  abombs:   ["abomination"],
};

/**
 * Analyzes free-form action text and returns the best-matching icon keys in order.
 * Optionally filtered by race — icons from other races are excluded.
 */
export function suggestIconKeys(
  actionText: string,
  myRace?: string,
): Array<{ key: string; path: string }> {
  if (!actionText.trim()) return [];

  const normalized = actionText
    .toLowerCase()
    .replace(/[→×x×+:]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = normalized.split(" ").filter((w) => w.length > 1);
  if (words.length === 0) return [];

  const expandedWords = new Set(words);
  for (const word of words) {
    const aliasExpansions = ALIASES[word];
    if (aliasExpansions) aliasExpansions.forEach((a) => expandedWords.add(a));
  }

  const scored = ALL_ICONS
    // Race filter: remove icons that belong to a different race
    .filter(({ key }) => {
      if (!myRace) return true;
      const iconRace = ICON_RACES[key];
      if (!iconRace || iconRace === "neutral") return true;
      return iconRace === myRace;
    })
    .map(({ key, path }) => {
      const keyParts = key.split("_");
      let score = 0;

      for (const word of expandedWords) {
        const wordParts = word.split("_");
        for (const kp of keyParts) {
          for (const wp of wordParts) {
            if (kp === wp) { score += 4; break; }
            if (kp.startsWith(wp) && wp.length >= 3) { score += 2; break; }
            if (wp.startsWith(kp) && kp.length >= 3) { score += 1; break; }
          }
        }
      }

      if (normalized.replace(/ /g, "_").includes(key)) score += 5;
      return { key, path, score };
    });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ key, path }) => ({ key, path }));
}

/**
 * Infers the BuildStepType from an icon key.
 * Used by the builder to auto-set the type when an icon is picked.
 */
export function iconKeyToStepType(key: string): string {
  // Workers are identified explicitly — some sit inside BUILDING_ICONS
  const WORKERS = new Set(["peon", "peasant", "acolyte", "wisp"]);
  if (WORKERS.has(key)) return "worker";

  // Research upgrades
  const RESEARCH = new Set([
    "defend", "bloodlust", "berserker_upgrade", "purge",
    "flak_cannons", "long_rifle", "storm_hammers", "corrosive_breath",
  ]);
  if (RESEARCH.has(key)) return "research";

  // Tier-up buildings
  const TECH = new Set([
    "stronghold", "fortress", "castle", "keep", "great_hall",
    "tree_of_ages", "tree_of_eternity", "hall_of_the_dead",
  ]);
  if (TECH.has(key)) return "tech";

  if (key in HERO_ICONS)     return "hero";
  if (key in UNIT_ICONS)     return "unit";
  if (key in BUILDING_ICONS) return "building";
  return "unit";
}

export function getUnitIcon(id: string): string {
  const path = UNIT_ICONS[id];
  if (!path) return "/race-icons/BTNFootman.png";
  const filename = path.split("/").pop() ?? "BTNFootman.png";
  return `/race-icons/${filename}`;
}

export function getHeroIcon(id: string): string {
  const path = HERO_ICONS[id];
  if (!path) return "/race-icons/BTNHeroPaladin.png";
  const filename = path.split("/").pop() ?? "BTNHeroPaladin.png";
  return `/race-icons/${filename}`;
}

/**
 * WC3 ability names whose icon filenames don't match the obvious PascalCase.
 * These are prepended to the candidate list so they're tried first.
 */
const ABILITY_ICON_OVERRIDES: Record<string, string[]> = {
  // ── Blademaster ────────────────────────────────────────────────
  "wind walk":              ["WindWalkOn", "WindWalkOff"],
  "bladestorm":             ["Whirlwind"],
  // ── Demon Hunter ───────────────────────────────────────────────
  "immolation":             ["ImmolationOn", "ImmolationOff"],
  // ── Paladin ────────────────────────────────────────────────────
  "divine shield":          ["DivineShieldOff"],
  "devotion aura":          ["Devotion"],
  "holy light":             ["HolyBolt"],
  // ── Mountain King ──────────────────────────────────────────────
  "avatar":                 ["AvatarOn", "Avatar"],
  // ── Shadow Hunter ──────────────────────────────────────────────
  "big bad voodoo":         ["BigBadVoodooSpell"],
  // ── Far Seer ───────────────────────────────────────────────────
  "feral spirit":           ["SpiritWolf"],
  // ── Crypt Lord ─────────────────────────────────────────────────
  "carrion beetles":        ["CarrionScarabsOn", "CarrionScarabs"],
  // ── Warden ─────────────────────────────────────────────────────
  "fan of knives":          ["FanOfKnives"],
  "blink":                  ["Blink"],
  "entangle":               ["EntanglingRoots"],
  "vengeance":              ["VengeanceIncarnate"],
  // ── Blood Mage ─────────────────────────────────────────────────
  "siphon mana":            ["ManaDrain"],
  // ── Case mismatches (filename has different capitalisation) ────
  "shockwave":              ["ShockWave"],
  "starfall":               ["StarFall"],
  "phase shift":            ["PhaseShiftOn", "PhaseShift"],
  "inner fire":             ["InnerFireOn", "InnerFire"],
  "searing arrows":         ["SearingArrowsOn", "SearingArrows"],
  "frost armor":            ["FrostArmorOn", "FrostArmor"],
  // ── Aura abilities ─────────────────────────────────────────────
  "brilliance aura":        ["Brilliance"],
  "unholy aura":            ["UnholyAura"],
  "trueshot aura":          ["TrueShot"],
  "thorns aura":            ["Thorns"],
  "vampiric aura":          ["VampiricAura"],
  "command aura":           ["CommandAura"],
  // ── Unit active/passive abilities ──────────────────────────────
  "detonate":               ["WispSplode"],
  "renew":                  ["WispHealOn"],
  "cloud":                  ["CloudOfFog"],
  "ethereal form":          ["EtherealFormOn", "EtherealForm"],
  "abolish magic":          ["AbsorbMagic"],
  "absorb mana":            ["AbsorbMagic"],
  "elune's grace":          ["ElunesBlessing"],
  "fragmentation shards":   ["FragmentationBombs"],
};

/** Resolve WC3 ability/upgrade icon paths from Liquipedia iconKey or name */
export function getAbilityIconCandidates(iconKey?: string, name?: string): string[] {
  const candidates: string[] = [];
  const add = (base: string) => {
    candidates.push(`/race-icons/BTN${base}.png`);
    candidates.push(`/race-icons/BTN${base}-Reforged.png`);
  };

  if (iconKey) {
    const raw = iconKey.replace(/\.(gif|png)$/i, "");
    const stripped = raw
      .replace(/^Wc3PAS/, "")
      .replace(/^Wc3/, "")
      .replace(/^PAS/, "")
      .replace(/^BTN/, "");
    add(stripped);
    if (stripped !== raw) add(raw);
    if (raw.startsWith("BTN")) {
      candidates.unshift(`/race-icons/${raw}.png`);
      candidates.unshift(`/race-icons/${raw}-Reforged.png`);
    }
  }

  if (name) {
    // Manual overrides — prepend so they're tried before auto-generated candidates
    const overrides = ABILITY_ICON_OVERRIDES[name.toLowerCase()];
    if (overrides) {
      for (const o of overrides) {
        candidates.unshift(`/race-icons/BTN${o}-Reforged.png`);
        candidates.unshift(`/race-icons/BTN${o}.png`);
      }
    }

    const pascal = (s: string) =>
      s.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");

    const full = pascal(name);
    add(full);

    // Singular form: "Envenomed Spears" → "EnvenomedSpear"
    if (full.endsWith("s")) add(full.slice(0, -1));

    const words = name.trim().split(/\s+/);

    // Drop last word: "Steel Ranged Weapons" → "SteelRanged"
    if (words.length >= 2) {
      const dropLast = pascal(words.slice(0, -1).join(" "));
      add(dropLast);
      if (dropLast.endsWith("s")) add(dropLast.slice(0, -1));
    }

    // Drop last two words: "Improved Steel Ranged Weapons" → "ImprovedSteel"
    if (words.length >= 3) {
      const dropLast2 = pascal(words.slice(0, -2).join(" "));
      add(dropLast2);
      if (dropLast2.endsWith("s")) add(dropLast2.slice(0, -1));
    }

    // Strip common WC3 suffix words and retry
    const NOISE_WORDS = new Set(["weapons", "upgrade", "upgrades", "armor", "attack", "ability"]);
    const filtered = words.filter((w) => !NOISE_WORDS.has(w.toLowerCase()));
    if (filtered.length > 0 && filtered.length < words.length) {
      const stripped = pascal(filtered.join(" "));
      add(stripped);
      if (stripped.endsWith("s")) add(stripped.slice(0, -1));
    }
  }

  return [...new Set(candidates)];
}

/**
 * Returns the icon path for a build step's iconKey.
 * Looks up in BUILDING_ICONS first, then UNIT_ICONS and HERO_ICONS.
 * Returns undefined if no icon is found (caller should fall back to emoji).
 */
export function getBuildStepIcon(iconKey: string): string | undefined {
  return BUILDING_ICONS[iconKey] ?? UNIT_ICONS[iconKey] ?? HERO_ICONS[iconKey] ?? undefined;
}

// Race faction icons — official Reforged faction art
export const RACE_ICONS: Record<string, string> = {
  human:    "/race-icons/Warcraft_III_Reforged_-_Humans_Icon.png",
  orc:      "/race-icons/Warcraft_III_Reforged_-_Orcs_Icon.png",
  nightelf: "/race-icons/Warcraft_III_Reforged_-_Night_Elves_Icon.png",
  undead:   "/race-icons/Warcraft_III_Reforged_-_Undead_Icon.png",
};
