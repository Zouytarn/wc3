import type { Race } from "./units";

export type BuildStepType =
  | "worker"    // train peon/peasant/wisp/acolyte
  | "building"  // construct a structure
  | "tech"      // upgrade main building tier
  | "unit"      // train combat unit
  | "hero"      // pick or level hero
  | "research"  // research upgrade
  | "expand"    // set up expansion
  | "army";     // move army / attack

export type BuildStyle = "aggressive" | "defensive" | "economic" | "standard";

export interface BuildStep {
  time: string;
  type: BuildStepType;
  action: string;
  note?: string;
  priority: "critical" | "normal" | "optional";
  /** Single icon key — matches a key in BUILDING_ICONS, UNIT_ICONS, or HERO_ICONS */
  iconKey?: string;
  /** Compound step: each entry renders as [icon] + label text. Overrides iconKey + action display. */
  iconSteps?: Array<{ key: string; label: string }>;
}

export interface BuildOrder {
  id: string;
  myRace: Race;
  enemyRace: Race;
  name: string;
  style: BuildStyle;
  strategy: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  heroOrder: string[];
  /** @deprecated use heroOrder[0] */
  heroFirst: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  steps: BuildStep[];
  lateGame: string;
  generalTips: string[];
}

// ─── HUMAN ───────────────────────────────────────────────────────────────────

const HUMAN_VS_HUMAN: BuildOrder = {
  id: "human_vs_human",
  myRace: "human",
  enemyRace: "human",
  name: "Fast Expand — Knight / Sorceress",
  style: "economic",
  strategy: "Archmage first for Water Elemental pressure, then transition into Knights + Sorceress support.",
  difficulty: "intermediate",
  heroOrder: ["archmage", "mountain_king"],
  heroFirst: "archmage",
  keyStrengths: ["Knight durability", "Sorceress Slow disrupts enemy", "Mass Teleport repositioning"],
  keyWeaknesses: ["Expensive food for Knights", "Mirror rewards better micro"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peasants",                      note: "Start with 5 peasants working",         priority: "critical",  iconKey: "peasant" },
    { time: "0:15", type: "worker",   action: "Send 4 to gold, 1 to lumber",            priority: "critical",  iconKey: "peasant" },
    { time: "0:30", type: "building", action: "Build Farm × 2 + Barracks",              priority: "critical",  iconSteps: [{ key: "farm", label: "Farm × 2" }, { key: "human_barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Train Footman × 2",                      priority: "critical",  iconKey: "footman" },
    { time: "1:30", type: "hero",     action: "Altar of Kings → Archmage",              priority: "critical",  iconSteps: [{ key: "altar_of_kings", label: "Altar" }, { key: "archmage", label: "Archmage" }] },
    { time: "2:00", type: "building", action: "Build Lumber Mill",                      priority: "normal",    iconKey: "lumber_mill" },
    { time: "2:45", type: "army",     action: "Creep nearest camp with Archmage",       note: "Get hero XP early",                    priority: "critical" },
    { time: "3:30", type: "research", action: "Blacksmith → Defend upgrade",            priority: "normal",    iconKey: "defend" },
    { time: "4:00", type: "unit",     action: "Arcane Sanctum → Sorceress × 2",         priority: "critical",  iconKey: "sorceress" },
    { time: "4:30", type: "hero",     action: "Archmage L3 — max Brilliance Aura",      priority: "critical",  iconKey: "archmage" },
    { time: "5:00", type: "unit",     action: "Stables → Knight × 2",                  note: "Need 2 Knights before pushing",         priority: "critical",  iconKey: "knight" },
    { time: "6:00", type: "army",     action: "Push: Archmage + Knights + Sorceress",   priority: "critical" },
    { time: "7:00", type: "hero",     action: "Second hero: Mountain King or Paladin",  priority: "normal",    iconKey: "mountain_king" },
    { time: "8:00", type: "research", action: "Storm Hammers if going Gryphons later",  priority: "optional",  iconKey: "storm_hammers" },
  ],
  lateGame: "Transition to Gryphon Riders vs heavy armor. Keep Sorceresses for Slow. Blood Mage + Banish for burst.",
  generalTips: [
    "Archmage Brilliance Aura is crucial — get L2 early.",
    "Mass Teleport saves your army when overextended.",
    "Sorceress Slow vs Knights is extremely powerful.",
    "Keep 2 Priests for Dispel and healing.",
  ],
};

const HUMAN_VS_ORC: BuildOrder = {
  id: "human_vs_orc",
  myRace: "human",
  enemyRace: "orc",
  name: "Rifles + Sorceress — Pierce Counter",
  style: "standard",
  strategy: "Riflemen pierce through Grunts' heavy armor. Sorceress Slow negates Bloodlust. Gryphons counter Taurens at tier 3.",
  difficulty: "beginner",
  heroOrder: ["archmage", "mountain_king"],
  heroFirst: "archmage",
  keyStrengths: ["Riflemen pierce heavy armor", "Sorceress Slow counters Bloodlust", "Gryphons counter Tauren"],
  keyWeaknesses: ["Vulnerable to early Grunt rush", "Headhunters outrange Riflemen"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peasants",                       priority: "critical",  iconKey: "peasant" },
    { time: "0:30", type: "building", action: "Build Farm × 2 + Barracks",               priority: "critical",  iconSteps: [{ key: "farm", label: "Farm × 2" }, { key: "human_barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Train Footman × 1 — hold early Grunts",   priority: "critical",  iconKey: "footman" },
    { time: "1:30", type: "hero",     action: "Altar → Archmage",                        priority: "critical",  iconSteps: [{ key: "altar_of_kings", label: "Altar" }, { key: "archmage", label: "Archmage" }] },
    { time: "2:00", type: "building", action: "Build Lumber Mill",                        priority: "critical",  iconKey: "lumber_mill" },
    { time: "2:30", type: "research", action: "Flak Cannons — counters Wyvern Riders",    priority: "normal",    iconKey: "flak_cannons" },
    { time: "3:00", type: "hero",     action: "Archmage: L1 Water Elemental, L2 Brilliance", priority: "critical", iconKey: "archmage" },
    { time: "3:30", type: "unit",     action: "Workshop → Rifleman × 3",                 note: "Pierce tears through Grunt heavy armor", priority: "critical",  iconKey: "rifleman" },
    { time: "4:00", type: "unit",     action: "Arcane Sanctum → Sorceress × 2",          note: "Slow + Brilliance Aura is crucial",    priority: "critical",  iconKey: "sorceress" },
    { time: "4:30", type: "research", action: "Long Rifle upgrade in Workshop",           priority: "normal",    iconKey: "long_rifle" },
    { time: "5:00", type: "army",     action: "Fight: Archmage + Footman + Rifles + Sorceress", priority: "critical" },
    { time: "5:30", type: "unit",     action: "Spell Breaker × 2 vs Witch Doctor/Shaman", priority: "normal",   iconKey: "spell_breaker" },
    { time: "6:30", type: "unit",     action: "Gryphon Aviary → Gryphon Riders (vs Tauren)", priority: "normal", iconKey: "gryphon_rider" },
    { time: "7:00", type: "research", action: "Storm Hammers upgrade for Gryphons",       priority: "optional",  iconKey: "storm_hammers" },
  ],
  lateGame: "Gryphon Rider magic attack wrecks Tauren (heavy armor). Keep Sorceresses alive. Mortars crack base defenses.",
  generalTips: [
    "Never let Riflemen engage Grunts in melee — keep behind Footmen.",
    "Slow Taurens immediately — their Pulverize AoE is devastating when fast.",
    "Spell Breakers counter Bloodlust, Purge, and Shaman mana.",
    "Watch for Blademaster Wind Walk — protect Riflemen/Sorceresses.",
  ],
};

const HUMAN_VS_NIGHTELF: BuildOrder = {
  id: "human_vs_nightelf",
  myRace: "human",
  enemyRace: "nightelf",
  name: "Archmage + Spell Breakers — Dispel Mass",
  style: "standard",
  strategy: "Spell Breakers counter NE casters. Blizzard counters grouped units. Priests Dispel Dryad/Faerie Dragon abilities.",
  difficulty: "intermediate",
  heroOrder: ["archmage", "mountain_king"],
  heroFirst: "archmage",
  keyStrengths: ["Dispel counters NE buff stacking", "Blizzard shreds massed Archers/Dryads", "MK Avatar ignores spells"],
  keyWeaknesses: ["Dryads are Spell Immune (hard to handle)", "Chimaera magic wrecks Knights"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peasants",                          priority: "critical",  iconKey: "peasant" },
    { time: "0:30", type: "building", action: "Farm × 2 + Barracks",                        priority: "critical",  iconSteps: [{ key: "farm", label: "Farm × 2" }, { key: "human_barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Footman × 2 — defend early Archer harass",   priority: "critical",  iconKey: "footman" },
    { time: "1:30", type: "hero",     action: "Altar → Archmage",                           priority: "critical",  iconSteps: [{ key: "altar_of_kings", label: "Altar" }, { key: "archmage", label: "Archmage" }] },
    { time: "2:00", type: "building", action: "Lumber Mill + Blacksmith",                    priority: "normal",    iconSteps: [{ key: "lumber_mill", label: "Lumber Mill" }, { key: "blacksmith", label: "Blacksmith" }] },
    { time: "3:00", type: "unit",     action: "Arcane Sanctum → Spell Breaker × 2",         note: "KEY unit vs NE",                       priority: "critical",  iconKey: "spell_breaker" },
    { time: "3:30", type: "hero",     action: "Archmage: L1 Blizzard, L2 Brilliance Aura",  priority: "critical",  iconKey: "archmage" },
    { time: "4:00", type: "research", action: "Spell Breaker — Control Magic upgrade",       priority: "normal" },
    { time: "4:30", type: "unit",     action: "Riflemen × 2 — anti-air vs Faerie Dragon",   priority: "critical",  iconKey: "rifleman" },
    { time: "5:00", type: "hero",     action: "Second hero: Mountain King",                  note: "Avatar counters druid spells",          priority: "normal",    iconKey: "mountain_king" },
    { time: "5:30", type: "army",     action: "Fight: AM + MK + Footmen + Spell Breakers",  priority: "critical" },
    { time: "6:00", type: "unit",     action: "Mortar Team × 2 if they have Ancients",      priority: "optional",  iconKey: "mortar_team" },
    { time: "7:00", type: "unit",     action: "Gryphon Riders to counter Chimaera push",    priority: "normal",    iconKey: "gryphon_rider" },
  ],
  lateGame: "Mass Gryphon Riders + Storm Hammers crushes Chimaeras. Keep Spell Breakers alive to drain Faerie Dragon mana.",
  generalTips: [
    "Spell Breakers dispel and absorb buffs — strip Roar/Bloodlust from NE.",
    "Watch for DH Mana Burn — protect your Archmage.",
    "Entangle from Keeper roots Knights — Priests ready to Dispel.",
    "Tranquility can be interrupted — focus Keeper when channeling.",
  ],
};

const HUMAN_VS_UNDEAD: BuildOrder = {
  id: "human_vs_undead",
  myRace: "human",
  enemyRace: "undead",
  name: "Paladin + Priests — Holy Counter",
  style: "standard",
  strategy: "Paladin Holy Light deals bonus damage to Undead. Priests Dispel skeleton armies. Gryphons shred heavy armor Abominations.",
  difficulty: "beginner",
  heroOrder: ["paladin", "archmage"],
  heroFirst: "paladin",
  keyStrengths: ["Holy Light damages Undead for bonus", "Priests Dispel skeleton armies", "Gryphons magic attack wrecks Abominations"],
  keyWeaknesses: ["Banshee Possess steals Knights/Gryphons", "Disease Cloud counters Priest healing"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peasants",                              priority: "critical",  iconKey: "peasant" },
    { time: "0:30", type: "building", action: "Farm × 2 + Barracks",                            priority: "critical",  iconSteps: [{ key: "farm", label: "Farm × 2" }, { key: "human_barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Footman × 2",                                    priority: "critical",  iconKey: "footman" },
    { time: "1:30", type: "hero",     action: "Altar → Paladin",                                note: "Holy Light does double damage vs Undead", priority: "critical", iconSteps: [{ key: "altar_of_kings", label: "Altar" }, { key: "paladin", label: "Paladin" }] },
    { time: "2:30", type: "unit",     action: "Arcane Sanctum → Priest × 3",                   note: "Dispel skeletons + heal",              priority: "critical",  iconKey: "priest" },
    { time: "3:00", type: "hero",     action: "Paladin: Devotion Aura L1, Holy Light L2",       priority: "critical",  iconKey: "paladin" },
    { time: "3:30", type: "unit",     action: "Stables → Knight × 2",                           priority: "critical",  iconKey: "knight" },
    { time: "4:00", type: "unit",     action: "Spell Breaker × 2 — dispel Disease Cloud",       priority: "normal",    iconKey: "spell_breaker" },
    { time: "4:30", type: "hero",     action: "Second hero: Archmage",                          note: "Brilliance Aura keeps Priests casting", priority: "normal",    iconKey: "archmage" },
    { time: "5:00", type: "army",     action: "Push: Paladin + AM + Knights + Priests",          priority: "critical" },
    { time: "6:00", type: "unit",     action: "Gryphon Aviary → Gryphons",                      note: "Magic attack vs Abomination heavy armor", priority: "critical", iconKey: "gryphon_rider" },
    { time: "7:00", type: "research", action: "Resurrection on Paladin",                         priority: "optional" },
  ],
  lateGame: "Gryphon Riders magic attack = 2× vs Abominations (heavy armor). Paladin Resurrection after big fights. Priests Dispel all Necromancer skeletons.",
  generalTips: [
    "Holy Light deals DOUBLE damage to Undead units — spam it in fights.",
    "Dispel skeletons raised by Necromancers immediately — they multiply fast.",
    "Gryphons + Storm Hammers stun Gargoyles mid-air.",
    "Keep Knights spread out — Banshee Possession loses one permanently.",
  ],
};

// ─── ORC ─────────────────────────────────────────────────────────────────────

const ORC_VS_HUMAN_BM: BuildOrder = {
  id: "orc_vs_human_bm",
  myRace: "orc",
  enemyRace: "human",
  name: "Blademaster Rush — Grunt Pressure",
  style: "aggressive",
  strategy: "Blademaster Wind Walk harasses Peasants and denies creeping. Grunts + Bloodlust pressure before Human can establish Sorceresses.",
  difficulty: "beginner",
  heroOrder: ["blademaster", "tauren_chieftain"],
  heroFirst: "blademaster",
  keyStrengths: ["Fast early pressure", "Bloodlust makes Grunts dominant vs Footmen", "BM kills isolated workers"],
  keyWeaknesses: ["Sorceress Slow hard-counters Bloodlust", "Riflemen pierce through Grunts", "Gryphons decimate Taurens"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                              priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Burrow × 2 + Barracks",                      priority: "critical",  iconSteps: [{ key: "burrow", label: "Burrow × 2" }, { key: "barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Train Grunt × 2",                             priority: "critical",  iconKey: "grunt" },
    { time: "1:30", type: "hero",     action: "Altar of Storms → Blademaster",               priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "blademaster", label: "Blademaster" }] },
    { time: "2:00", type: "army",     action: "Wind Walk → harass Human Peasants",           note: "Kills workers, denies hero creeping",   priority: "critical" },
    { time: "2:30", type: "building", action: "Voodoo Lounge → train Shaman",                priority: "critical",  iconSteps: [{ key: "voodoo_lounge", label: "Voodoo Lounge" }, { key: "shaman", label: "Shaman" }] },
    { time: "3:00", type: "research", action: "Shaman — Bloodlust (rush it ASAP)",           priority: "critical",  iconKey: "bloodlust" },
    { time: "3:30", type: "unit",     action: "Grunt × 3 (deadly with Bloodlust)",            priority: "critical",  iconKey: "grunt" },
    { time: "4:00", type: "hero",     action: "Blademaster L3 — Mirror Image",               priority: "normal",    iconKey: "blademaster" },
    { time: "4:30", type: "army",     action: "Attack: BM + Grunts + Shaman (Bloodlust all)", priority: "critical" },
    { time: "5:00", type: "unit",     action: "Raider × 2 — Ensnare Flying Machines/Gryphons", priority: "normal",  iconKey: "raider" },
    { time: "5:30", type: "hero",     action: "Second hero: Tauren Chieftain",               note: "Endurance Aura scales entire army",     priority: "normal",    iconKey: "tauren_chieftain" },
    { time: "6:00", type: "unit",     action: "Tauren Warrior × 2 — game-enders",            priority: "normal",    iconKey: "tauren" },
    { time: "7:00", type: "unit",     action: "Demolisher × 1 if opponent turtles",           priority: "optional",  iconKey: "catapult" },
  ],
  lateGame: "TC Endurance Aura + Bloodlust + Taurens = unstoppable frontline. Spirit Walkers counter Sorceress spells. Wyvern Riders handle Gryphons.",
  generalTips: [
    "Bloodlust EVERYTHING before a fight — it's the difference between winning and losing.",
    "BM Wind Walk kills Peasants and denies expansions.",
    "Purge from Shaman removes Slow from your Taurens — critical.",
    "Raider Ensnare Gryphons immediately — ground them.",
  ],
};

const ORC_VS_HUMAN_FS: BuildOrder = {
  id: "orc_vs_human_fs",
  myRace: "orc",
  enemyRace: "human",
  name: "Far Seer + Headhunters — Standard",
  style: "standard",
  strategy: "The most versatile Orc opener. Far Seer wolves provide a safe frontline for early creeping. Headhunters' high DPS melts Human armies. Harass to delay Archmage XP gain.",
  difficulty: "beginner",
  heroOrder: ["far_seer", "shadow_hunter"],
  heroFirst: "far_seer",
  keyStrengths: ["Versatile — works vs any race", "FS wolves tank creep damage for free", "Headhunter Berserkers have highest DPS in tier 1-2"],
  keyWeaknesses: ["Slower tech — 2nd hero arrives later", "Headhunters vulnerable before Berserker upgrade"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                                note: "Send to gold immediately",             priority: "critical",  iconKey: "peon" },
    { time: "0:15", type: "worker",   action: "Send 4 Peons to gold, 1 to lumber",             priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Altar of Storms",                               note: "Hero building first — priority",        priority: "critical",  iconKey: "altar_of_storms" },
    { time: "0:40", type: "building", action: "Burrow × 2 (supply + defense)",                 priority: "critical",  iconKey: "burrow" },
    { time: "0:50", type: "building", action: "Barracks",                                      priority: "critical",  iconKey: "barracks" },
    { time: "1:15", type: "hero",     action: "Far Seer — Feral Spirit L1 immediately",        note: "Wolves tank creep damage for free",     priority: "critical",  iconKey: "far_seer" },
    { time: "1:30", type: "unit",     action: "Headhunter × 2",                                priority: "critical",  iconKey: "headhunter" },
    { time: "2:00", type: "army",     action: "Creep: FS wolves + Headhunters at nearby camp", note: "Keep wolves between enemies and HH",   priority: "critical" },
    { time: "2:30", type: "building", action: "War Mill",                                      note: "Needed for Berserker upgrade",          priority: "critical" },
    { time: "2:45", type: "unit",     action: "Headhunter × 2 (keep queue running)",           priority: "critical",  iconKey: "headhunter" },
    { time: "3:00", type: "army",     action: "Harass Human Peasants with Far Seer",           note: "Deny Archmage XP + early pressure",    priority: "critical" },
    { time: "3:30", type: "building", action: "Voodoo Lounge → train Shaman",                  priority: "normal",    iconSteps: [{ key: "voodoo_lounge", label: "Voodoo Lounge" }, { key: "shaman", label: "Shaman" }] },
    { time: "4:00", type: "research", action: "Berserker Upgrade — massive Headhunter DPS boost", priority: "critical",  iconKey: "berserker_upgrade" },
    { time: "4:30", type: "tech",     action: "Great Hall → Stronghold (Tier 2)",              note: "Unlocks Bloodlust + 2nd hero",          priority: "critical",  iconKey: "stronghold" },
    { time: "5:00", type: "unit",     action: "Shaman → Bloodlust",                            priority: "critical",  iconKey: "shaman" },
    { time: "5:30", type: "hero",     action: "Second hero: Shadow Hunter",                    note: "Healing Wave keeps army alive",         priority: "normal",    iconKey: "shadow_hunter" },
    { time: "6:00", type: "army",     action: "Push: FS + SH + Berserker HH (Bloodlust)",     priority: "critical" },
    { time: "7:00", type: "unit",     action: "Raider × 2 — Ensnare Gryphons",                priority: "normal",    iconKey: "raider" },
  ],
  lateGame: "Tech to Tier 3 → Tauren + Spirit Walkers + triple hero. Shadow Hunter Healing Wave keeps army alive in extended fights. Earthquake ultimate ends sieges.",
  generalTips: [
    "Always summon FS wolves before engaging creeps — they absorb all damage.",
    "Bloodlust Berserker Headhunters before every fight — extremely high damage output.",
    "Harass Human Peasants to deny Archmage XP — a behind Archmage loses fights.",
    "Raider Ensnare is critical vs Gryphon Riders — grounded Gryphon is useless.",
  ],
};

const ORC_VS_ORC: BuildOrder = {
  id: "orc_vs_orc",
  myRace: "orc",
  enemyRace: "orc",
  name: "Far Seer + Headhunters — Creep Advantage",
  style: "standard",
  strategy: "Far Seer summons + Chain Lightning. Headhunter Berserkers out-DPS Grunts. Win with superior hero levels from faster creeping.",
  difficulty: "intermediate",
  heroOrder: ["far_seer", "blademaster"],
  heroFirst: "far_seer",
  keyStrengths: ["Headhunter Berserker very high DPS", "FS wolves provide safe creeping", "Chain Lightning hits multiple Grunts"],
  keyWeaknesses: ["Berserker upgrade leaves Headhunters temporarily vulnerable", "Gets outscaled by BM builds late"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                                  priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Altar + Burrow × 2 + Barracks",                  priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "burrow", label: "Burrow × 2" }, { key: "barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Headhunter × 2",                                  priority: "critical",  iconKey: "headhunter" },
    { time: "1:30", type: "hero",     action: "Altar → Far Seer — Feral Spirit L1",              priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "far_seer", label: "Far Seer" }] },
    { time: "2:00", type: "army",     action: "Creep: FS wolves tank, Headhunters DPS",          priority: "critical" },
    { time: "2:30", type: "building", action: "War Mill → Voodoo Lounge",                        priority: "normal",    iconKey: "voodoo_lounge" },
    { time: "3:00", type: "research", action: "Headhunter Berserker upgrade",                    priority: "critical",  iconKey: "berserker_upgrade" },
    { time: "3:30", type: "unit",     action: "Shaman × 2 → Bloodlust",                         priority: "critical",  iconKey: "shaman" },
    { time: "4:00", type: "army",     action: "Fight: FS + wolves + Headhunters (Bloodlust)",    priority: "critical" },
    { time: "5:00", type: "hero",     action: "Second hero: Blademaster (scouting) or TC (aura)", priority: "normal",   iconKey: "blademaster" },
    { time: "5:30", type: "unit",     action: "Tauren × 2 for unstoppable late game",             priority: "normal",    iconKey: "tauren" },
    { time: "6:00", type: "hero",     action: "Earthquake ultimate: siege enemy base",            priority: "critical",  iconKey: "far_seer" },
  ],
  lateGame: "FS Earthquake + Demolishers makes your push unstoppable. Tauren + Bloodlust ends the game. Spirit Walkers for anti-spell defense.",
  generalTips: [
    "Creep faster than opponent — hero level advantage wins Orc mirror.",
    "Headhunter Berserker upgrade beats Grunt-heavy opponents.",
    "FS wolves are free — always summon before fights.",
    "Bloodlust on Taurens is game-ending — they become near-unkillable.",
  ],
};

const ORC_VS_NIGHTELF_TC: BuildOrder = {
  id: "orc_vs_nightelf_tc",
  myRace: "orc",
  enemyRace: "nightelf",
  name: "Tauren Chieftain + Grunts — Frontline Domination",
  style: "aggressive",
  strategy: "Grunts + TC Endurance Aura overwhelm NE mobility. Shaman Purge counters Entangle. Spirit Walkers counter Dryad spell immunity.",
  difficulty: "intermediate",
  heroOrder: ["tauren_chieftain", "shadow_hunter"],
  heroFirst: "tauren_chieftain",
  keyStrengths: ["TC Endurance Aura + Bloodlust is unstoppable", "Grunts tank Archer piercing", "Raider Ensnare grounds Hippogryphs"],
  keyWeaknesses: ["Faerie Dragon Mana Flare punishes casters", "Dryad spell immunity frustrating"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                                   priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Burrow × 2 + Barracks",                           priority: "critical",  iconSteps: [{ key: "burrow", label: "Burrow × 2" }, { key: "barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Grunt × 2 (tank Archer damage well)",              priority: "critical",  iconKey: "grunt" },
    { time: "1:30", type: "hero",     action: "Altar → Tauren Chieftain",                         priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "tauren_chieftain", label: "Tauren Chieftain" }] },
    { time: "2:00", type: "hero",     action: "TC: Endurance Aura L1 — immediately boosts army",  priority: "critical",  iconKey: "tauren_chieftain" },
    { time: "2:30", type: "building", action: "Voodoo Lounge → Shaman (Bloodlust + Purge)",       priority: "critical",  iconSteps: [{ key: "voodoo_lounge", label: "Voodoo Lounge" }, { key: "shaman", label: "Shaman" }] },
    { time: "3:00", type: "unit",     action: "Grunt × 4 (Endurance Aura + Bloodlust = dominant)", priority: "critical", iconKey: "grunt" },
    { time: "3:30", type: "hero",     action: "War Stomp L1 — interrupt Keeper Tranquility",      priority: "critical",  iconKey: "tauren_chieftain" },
    { time: "4:00", type: "army",     action: "Attack: TC + Shamans (Bloodlust+Purge) + Grunts",  priority: "critical" },
    { time: "5:00", type: "unit",     action: "Raider × 2 — Ensnare Hippogryph/Chimaera",         priority: "critical",  iconKey: "raider" },
    { time: "5:30", type: "unit",     action: "Wyvern Riders × 2 (anti-air)",                     priority: "normal",    iconKey: "wind_rider" },
    { time: "6:00", type: "hero",     action: "Second hero: Shadow Hunter",                       note: "Healing Wave keeps army alive",         priority: "normal",    iconKey: "shadow_hunter" },
    { time: "7:00", type: "unit",     action: "Tauren × 2 (Pulverize AoE destroys NE groups)",    priority: "critical",  iconKey: "tauren" },
  ],
  lateGame: "Tauren + TC Endurance Aura + Bloodlust is nearly unstoppable. Raider Ensnare grounds every Chimaera. Demolisher pressure forces NE to defend.",
  generalTips: [
    "Purge counters Keeper Entangle on your heroes — use immediately when rooted.",
    "War Stomp interrupts Tranquility (must be in range) — save mana for this.",
    "Ensnare every flying NE unit — grounded Chimaera is useless vs Grunts.",
    "Fight in the open — NE has vision advantage in forests.",
  ],
};

const ORC_VS_NIGHTELF_FS: BuildOrder = {
  id: "orc_vs_nightelf_fs",
  myRace: "orc",
  enemyRace: "nightelf",
  name: "Far Seer + Headhunters — Cautious Pressure",
  style: "defensive",
  strategy: "FS wolves provide safe early game vs NE hero harass. Headhunters accumulate to critical mass before engaging. Expand on Tier 2.",
  difficulty: "intermediate",
  heroOrder: ["far_seer", "tauren_chieftain"],
  heroFirst: "far_seer",
  keyStrengths: ["FS wolves survive NE hero harassment", "Headhunter range safer than Grunts vs Archers", "Tier 2 expand gives economic lead"],
  keyWeaknesses: ["Headhunters vulnerable before reaching critical mass", "Can crumble vs Keeper of the Grove builds"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                                   priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Altar + Burrow × 2 + Barracks",                   priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "burrow", label: "Burrow × 2" }, { key: "barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Headhunter × 2",                                   priority: "critical",  iconKey: "headhunter" },
    { time: "1:30", type: "hero",     action: "Altar → Far Seer — Feral Spirit L1",               priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "far_seer", label: "Far Seer" }] },
    { time: "2:00", type: "army",     action: "Creep carefully — keep HH back until 4+ units",    note: "NE DH/KotG can wipe small HH groups", priority: "critical" },
    { time: "2:30", type: "building", action: "War Mill",                                          priority: "critical" },
    { time: "3:00", type: "unit",     action: "Headhunter × 3 more (build to critical mass)",      priority: "critical",  iconKey: "headhunter" },
    { time: "3:30", type: "research", action: "Berserker Upgrade",                                 priority: "critical" },
    { time: "4:00", type: "tech",     action: "Great Hall → Stronghold (Tier 2)",                 priority: "critical",  iconKey: "stronghold" },
    { time: "4:30", type: "expand",   action: "Secure expansion — contested mine or close expo",   priority: "critical" },
    { time: "5:00", type: "building", action: "Voodoo Lounge → Bloodlust",                        priority: "critical",  iconSteps: [{ key: "voodoo_lounge", label: "Voodoo Lounge" }, { key: "bloodlust", label: "Bloodlust" }] },
    { time: "5:30", type: "hero",     action: "Second hero: TC",                                  note: "War Stomp vs Keeper channeling",        priority: "normal",    iconKey: "tauren_chieftain" },
    { time: "6:00", type: "army",     action: "Push with 6+ Berserker HH + FS + TC + Bloodlust",  priority: "critical" },
    { time: "7:00", type: "unit",     action: "Raider × 2 — Ensnare Chimaeras",                   priority: "normal",    iconKey: "raider" },
  ],
  lateGame: "Tier 3 with double Lodge → Master Shamans + Berserkers. Economic lead from early expand wins long games. Tech to Tauren for physical power vs Chimaera.",
  generalTips: [
    "Don't commit Headhunters until you have 5+ — they die fast alone vs DH.",
    "FS Earthquake collapses Ancient of Lore and War of Ages buildings fast.",
    "War Stomp TC interrupts Keeper Tranquility — save the spell for this.",
    "Ensnare every Chimaera immediately — grounded they die to Berserkers.",
  ],
};

const ORC_VS_UNDEAD: BuildOrder = {
  id: "orc_vs_undead",
  myRace: "orc",
  enemyRace: "undead",
  name: "Blademaster + Taurens — Pressure Undead Expansion",
  style: "aggressive",
  strategy: "Blademaster Wind Walk kills Acolytes. Orc physical power overpowers Undead casters. Raider Ensnare grounds Gargoyles.",
  difficulty: "beginner",
  heroOrder: ["blademaster", "tauren_chieftain"],
  heroFirst: "blademaster",
  keyStrengths: ["BM kills Acolytes in Wind Walk", "TC Endurance + Bloodlust beats Undead frontline", "Purge removes Frost Armor"],
  keyWeaknesses: ["Necromancer skeletons scale hard", "Banshee Possession of Taurens is devastating"],
  steps: [
    { time: "0:00", type: "worker",   action: "Queue 3 Peons",                                    priority: "critical",  iconKey: "peon" },
    { time: "0:30", type: "building", action: "Burrow × 2 + Barracks",                            priority: "critical",  iconSteps: [{ key: "burrow", label: "Burrow × 2" }, { key: "barracks", label: "Barracks" }] },
    { time: "1:00", type: "unit",     action: "Grunt × 2",                                        priority: "critical",  iconKey: "grunt" },
    { time: "1:30", type: "hero",     action: "Altar → Blademaster",                               priority: "critical",  iconSteps: [{ key: "altar_of_storms", label: "Altar" }, { key: "blademaster", label: "Blademaster" }] },
    { time: "2:00", type: "army",     action: "Wind Walk → harass Undead Acolytes",               note: "Kills workers and denies expansion",   priority: "critical" },
    { time: "2:30", type: "building", action: "Voodoo Lounge → train Shaman",                      priority: "critical",  iconSteps: [{ key: "voodoo_lounge", label: "Voodoo Lounge" }, { key: "shaman", label: "Shaman" }] },
    { time: "3:00", type: "unit",     action: "Headhunters × 3 (counter Gargoyles)",               note: "Anti-air pierce damage",               priority: "critical",  iconKey: "headhunter" },
    { time: "3:30", type: "research", action: "Shaman Purge — removes Frost Armor from Abominations", priority: "critical",  iconKey: "purge" },
    { time: "4:00", type: "hero",     action: "Second hero: Tauren Chieftain",                     note: "Endurance Aura + Bloodlust combo",      priority: "critical",  iconKey: "tauren_chieftain" },
    { time: "5:00", type: "unit",     action: "Raider × 2 — Ensnare Gargoyles",                   priority: "critical",  iconKey: "raider" },
    { time: "5:30", type: "unit",     action: "Tauren × 2 (Pulverize hits multiple Ghouls)",       priority: "critical",  iconKey: "tauren" },
    { time: "6:30", type: "unit",     action: "Demolisher × 1 for sieging Necropolis",             priority: "optional",  iconKey: "catapult" },
  ],
  lateGame: "Taurens + TC Endurance + Bloodlust physically overwhelms Undead. Keep Shamans alive to Purge Frost Armor. Retreat vs Lich Death and Decay channeling.",
  generalTips: [
    "Wind Walk BM in enemy base — kill Acolytes before they can expand.",
    "Spread Taurens — Banshee Possession loses you a unit permanently.",
    "Purge Abomination Disease Cloud aura.",
    "Ensnare Gargoyles to ground them — Grunts destroy them easily.",
  ],
};

// ─── NIGHT ELF ───────────────────────────────────────────────────────────────

const NIGHTELF_VS_HUMAN: BuildOrder = {
  id: "nightelf_vs_human",
  myRace: "nightelf",
  enemyRace: "human",
  name: "Demon Hunter + Dryads — Mana Burn Casters",
  style: "standard",
  strategy: "DH Mana Burn cripples Archmage. Dryads immune to and counter Human spells. Chimaeras shred Knights' heavy armor.",
  difficulty: "intermediate",
  heroOrder: ["demon_hunter", "keeper_of_the_grove"],
  heroFirst: "demon_hunter",
  keyStrengths: ["Mana Burn cripples Sorceress/Archmage", "Dryad spell immunity frustrates casters", "Chimaera magic vs heavy armor"],
  keyWeaknesses: ["Spell Breakers counter Faerie Dragons", "Rifles shred Archer/Dryad light armor"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Wisps",                                    priority: "critical",  iconKey: "wisp" },
    { time: "0:30", type: "building", action: "Moon Well × 2 + Ancient of War",                   priority: "critical",  iconSteps: [{ key: "moon_well", label: "Moon Well × 2" }, { key: "ancient_of_war", label: "Ancient of War" }] },
    { time: "1:00", type: "unit",     action: "Archer × 2",                                       priority: "critical",  iconKey: "archer" },
    { time: "1:30", type: "hero",     action: "Altar → Demon Hunter",                              priority: "critical",  iconSteps: [{ key: "altar_of_elders", label: "Altar" }, { key: "demon_hunter", label: "Demon Hunter" }] },
    { time: "2:00", type: "hero",     action: "DH: Mana Burn L1 — target Archmage immediately",   priority: "critical",  iconKey: "demon_hunter" },
    { time: "2:30", type: "unit",     action: "Ancient of Lore → Dryad × 2",                      note: "Spell immune, dispels Human buffs",   priority: "critical",  iconKey: "dryad" },
    { time: "3:00", type: "hero",     action: "DH Immolation L1 for sustained AoE",               priority: "normal",    iconKey: "demon_hunter" },
    { time: "3:30", type: "unit",     action: "Huntress × 2 (Moon Glaive hits grouped Footmen)",   priority: "normal",    iconKey: "huntress" },
    { time: "4:00", type: "army",     action: "Fight: DH + Archers + Dryads + Huntresses",        priority: "critical" },
    { time: "4:30", type: "hero",     action: "Second hero: Keeper of the Grove",                  note: "Entangle roots Knights",               priority: "normal",    iconKey: "keeper_of_the_grove" },
    { time: "5:00", type: "unit",     action: "Ancient of Wind → Faerie Dragon × 2",               note: "Counter Human casters",                priority: "optional",  iconKey: "faerie_dragon" },
    { time: "6:00", type: "unit",     action: "Chimaera × 2",                                     note: "Magic attack wrecks Knight heavy armor", priority: "critical", iconKey: "chimaera" },
    { time: "7:00", type: "research", action: "Corrosive Breath upgrade for Chimaeras",            priority: "normal",    iconKey: "corrosive_breath" },
  ],
  lateGame: "Chimaeras with Corrosive Breath AoE devastate Human armies. DH Metamorphosis at L6 wins fights. Keep Dryads alive — they nullify the Human spell kit.",
  generalTips: [
    "Target Archmage with DH Mana Burn — without mana he's useless.",
    "Dryad Abolish Magic mass-dispels all Human caster buffs.",
    "Chimaera magic = 200% vs Knights/Footmen (heavy armor).",
    "Keeper Entangle roots enemy heroes — combo with focused fire.",
  ],
};

const NIGHTELF_VS_ORC: BuildOrder = {
  id: "nightelf_vs_orc",
  myRace: "nightelf",
  enemyRace: "orc",
  name: "Keeper + Dryads — Sustain and Counter",
  style: "defensive",
  strategy: "Keeper Thorns Aura punishes Grunts in melee. Dryads counter Shaman/Witch Doctor. Cyclone removes Taurens. Chimaera vs Wyvern.",
  difficulty: "advanced",
  heroOrder: ["keeper_of_the_grove", "demon_hunter"],
  heroFirst: "keeper_of_the_grove",
  keyStrengths: ["Thorns Aura punishes Grunt melee", "Cyclone removes Tauren temporarily", "Chimaera magic vs Wyvern"],
  keyWeaknesses: ["Orc physical pressure very strong", "Raider Ensnare grounds your flyers"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Wisps",                                    priority: "critical",  iconKey: "wisp" },
    { time: "0:30", type: "building", action: "Moon Well × 2 + Ancient of War",                   priority: "critical",  iconSteps: [{ key: "moon_well", label: "Moon Well × 2" }, { key: "ancient_of_war", label: "Ancient of War" }] },
    { time: "1:00", type: "unit",     action: "Huntress × 2 (melee, hold Grunt pressure)",         priority: "critical",  iconKey: "huntress" },
    { time: "1:30", type: "hero",     action: "Altar → Keeper of the Grove",                       priority: "critical",  iconSteps: [{ key: "altar_of_elders", label: "Altar" }, { key: "keeper_of_the_grove", label: "Keeper" }] },
    { time: "2:00", type: "hero",     action: "Keeper: Thorns Aura L1 (damages Grunts back)",      priority: "critical",  iconKey: "keeper_of_the_grove" },
    { time: "2:30", type: "unit",     action: "Ancient of Lore → Dryad × 3",                      note: "Spell immune vs Shaman/Witch Doctor",  priority: "critical",  iconKey: "dryad" },
    { time: "3:00", type: "hero",     action: "Keeper: Entangle L2 (root Taurens/TC)",             priority: "critical",  iconKey: "keeper_of_the_grove" },
    { time: "3:30", type: "unit",     action: "Ancient of Wind → Druid of the Talon × 1",         note: "Cyclone Taurens out of fights",        priority: "critical",  iconKey: "druid_of_the_talon" },
    { time: "4:00", type: "hero",     action: "Force of Nature: Treants as meat shield",           priority: "normal",    iconKey: "keeper_of_the_grove" },
    { time: "4:30", type: "hero",     action: "Second hero: Demon Hunter",                        note: "Mana Burn vs Shamans",                  priority: "normal",    iconKey: "demon_hunter" },
    { time: "5:00", type: "army",     action: "Fight: KotG + DH + Huntresses + Dryads + Druids",  priority: "critical" },
    { time: "6:00", type: "unit",     action: "Chimaera × 2 (magic counters Wyvern Rider)",        priority: "critical",  iconKey: "chimaera" },
    { time: "7:00", type: "unit",     action: "Hippogryph + mounted Archer for air support",        priority: "optional",  iconKey: "hippogryph" },
  ],
  lateGame: "Chimaeras + Faerie Dragons + Tranquility win extended fights. Keep Cycloning Taurens. Keeper Tranquility heals full army — protect during channel.",
  generalTips: [
    "Cyclone Taurens out of fights — 15 seconds is a massive advantage.",
    "Dryad Slow Poison reduces Grunt attack speed — reduces Bloodlust effectiveness.",
    "Entangle the Tauren Chieftain — his Endurance Aura gone is huge.",
    "Keeper Tranquility heals 30+ HP/sec to all — use after a hard fight.",
  ],
};

const NIGHTELF_VS_NIGHTELF: BuildOrder = {
  id: "nightelf_vs_nightelf",
  myRace: "nightelf",
  enemyRace: "nightelf",
  name: "Demon Hunter + PotM — Creep Fast + Aura Stack",
  style: "economic",
  strategy: "PotM Trueshot Aura + Archers wins ranged battles. DH Mana Burn counters enemy Keeper/PotM. Control map with superior hero levels.",
  difficulty: "intermediate",
  heroOrder: ["demon_hunter", "priestess_of_the_moon"],
  heroFirst: "demon_hunter",
  keyStrengths: ["Trueshot Aura scales all ranged units", "Dryad counters enemy Druids", "Superior creeping speed wins mirror"],
  keyWeaknesses: ["Mirror rewards better macro and micro", "Mountain Giant Taunt hard to counter"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Wisps",                                    priority: "critical",  iconKey: "wisp" },
    { time: "0:30", type: "building", action: "Moon Well × 2 + Ancient of War",                   priority: "critical",  iconSteps: [{ key: "moon_well", label: "Moon Well × 2" }, { key: "ancient_of_war", label: "Ancient of War" }] },
    { time: "1:00", type: "unit",     action: "Archer × 2",                                       priority: "critical",  iconKey: "archer" },
    { time: "1:30", type: "hero",     action: "Altar → Demon Hunter",                              priority: "critical",  iconSteps: [{ key: "altar_of_elders", label: "Altar" }, { key: "demon_hunter", label: "Demon Hunter" }] },
    { time: "2:00", type: "hero",     action: "DH: Evasion or Mana Burn — creep fast",            priority: "critical",  iconKey: "demon_hunter" },
    { time: "2:30", type: "hero",     action: "Second Altar → Priestess of the Moon",              priority: "critical",  iconKey: "priestess_of_the_moon" },
    { time: "3:00", type: "hero",     action: "PotM: Trueshot Aura L1 immediately",               priority: "critical",  iconKey: "priestess_of_the_moon" },
    { time: "3:30", type: "unit",     action: "Archer × 4 (Trueshot Aura makes them very strong)", priority: "critical",  iconKey: "archer" },
    { time: "4:00", type: "unit",     action: "Dryad × 2 (dispel enemy buffs/Keeper Roar)",        priority: "normal",    iconKey: "dryad" },
    { time: "4:30", type: "hero",     action: "DH Metamorphosis when L6",                         priority: "critical",  iconKey: "demon_hunter" },
    { time: "5:00", type: "army",     action: "Fight: DH + PotM + Archers + Dryads",              priority: "critical" },
    { time: "6:00", type: "unit",     action: "Chimaera × 2 (wins Chimaera wars due to aura)",    priority: "normal",    iconKey: "chimaera" },
  ],
  lateGame: "DH Metamorphosis + PotM Starfall is a fight-ending combo. Mass Chimaeras out-trade enemy Chimaeras. Keeper counters Keeper with Entangle.",
  generalTips: [
    "Hero levels matter most in NE mirror — creep constantly.",
    "DH Mana Burn vs enemy Keeper/PotM removes key abilities.",
    "Starfall + Metamorphosis combo at L6 — initiate big fights.",
    "Dryad Abolish Magic mass dispels Keeper's Force of Nature treants.",
  ],
};

const NIGHTELF_VS_UNDEAD: BuildOrder = {
  id: "nightelf_vs_undead",
  myRace: "nightelf",
  enemyRace: "undead",
  name: "PotM + Dryads — Dispel and Long-Range Pressure",
  style: "standard",
  strategy: "Dryads dispel Unholy Aura regen. Abolish Magic clears skeleton armies instantly. Chimaera magic wrecks Abomination/Crypt Fiend heavy armor.",
  difficulty: "beginner",
  heroOrder: ["priestess_of_the_moon", "demon_hunter"],
  heroFirst: "priestess_of_the_moon",
  keyStrengths: ["Abolish Magic destroys skeleton armies", "Chimaera magic wrecks Abomination heavy armor", "Starfall is devastating vs Undead clusters"],
  keyWeaknesses: ["Gargoyle Stone Form annoying to handle", "Frost Wyrm requires anti-air"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Wisps",                                    priority: "critical",  iconKey: "wisp" },
    { time: "0:30", type: "building", action: "Moon Well × 2 + Ancient of War",                   priority: "critical",  iconSteps: [{ key: "moon_well", label: "Moon Well × 2" }, { key: "ancient_of_war", label: "Ancient of War" }] },
    { time: "1:00", type: "unit",     action: "Archer × 2",                                       priority: "critical",  iconKey: "archer" },
    { time: "1:30", type: "hero",     action: "Altar → Priestess of the Moon",                    priority: "critical",  iconSteps: [{ key: "altar_of_elders", label: "Altar" }, { key: "priestess_of_the_moon", label: "Priestess" }] },
    { time: "2:00", type: "hero",     action: "PotM: Trueshot Aura L1",                           priority: "critical",  iconKey: "priestess_of_the_moon" },
    { time: "2:30", type: "unit",     action: "Ancient of Lore → Dryad × 3",                      note: "Abolish Magic vs skeletons",           priority: "critical",  iconKey: "dryad" },
    { time: "3:00", type: "unit",     action: "Archer × 4 (Trueshot Aura makes them very strong)", priority: "critical",  iconKey: "archer" },
    { time: "3:30", type: "hero",     action: "Second hero: Demon Hunter",                        note: "Mana Burn vs DK/Lich",                  priority: "normal",    iconKey: "demon_hunter" },
    { time: "4:00", type: "hero",     action: "DH Immolation: stacks well vs skeleton mobs",      priority: "normal",    iconKey: "demon_hunter" },
    { time: "4:30", type: "army",     action: "Fight: PotM + DH + Archers + Dryads",              priority: "critical" },
    { time: "5:30", type: "unit",     action: "Ancient of Wind → Faerie Dragon × 2",               note: "Counter Destroyer/casters",            priority: "optional",  iconKey: "faerie_dragon" },
    { time: "6:00", type: "unit",     action: "Chimaera × 3",                                     note: "Magic: 200% vs Abomination heavy armor", priority: "critical", iconKey: "chimaera" },
    { time: "7:00", type: "hero",     action: "PotM Starfall when army engages — continuous AoE", priority: "critical",  iconKey: "priestess_of_the_moon" },
  ],
  lateGame: "Chimaera magic destroys Abomination/Crypt Fiend (heavy armor). DH Metamorphosis + Starfall ends the game. Dryads keep dispelling every skeleton wave.",
  generalTips: [
    "Abolish Magic (Dryad) instantly destroys all Necromancer-raised skeletons.",
    "DH Mana Burn on Death Knight removes Unholy Aura and Raise Dead.",
    "Chimaeras deal double damage to Abominations and Crypt Fiends (heavy armor).",
    "Fan of Knives Warden is excellent vs massed Ghoul armies.",
  ],
};

// ─── UNDEAD ───────────────────────────────────────────────────────────────────

const UNDEAD_VS_HUMAN: BuildOrder = {
  id: "undead_vs_human",
  myRace: "undead",
  enemyRace: "human",
  name: "Death Knight + Crypt Fiend — Sustainable Attrition",
  style: "defensive",
  strategy: "DK Unholy Aura sustains Ghoul army. Crypt Fiend anti-air eliminates Flying Machines/Gryphons. Banshee possession steals key units.",
  difficulty: "intermediate",
  heroOrder: ["death_knight", "dread_lord"],
  heroFirst: "death_knight",
  keyStrengths: ["DK Unholy Aura regen hard to trade against", "Crypt Fiend webs ground every flyer", "Banshee possession of Knights/Gryphons"],
  keyWeaknesses: ["Paladin Holy Light damages Undead for bonus", "Priests Dispel skeleton armies instantly"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Acolytes",                                 priority: "critical",  iconKey: "acolyte" },
    { time: "0:30", type: "building", action: "Crypt (Ghoul production) + Altar",                  priority: "critical",  iconSteps: [{ key: "crypt", label: "Crypt" }, { key: "altar_of_darkness", label: "Altar" }] },
    { time: "1:00", type: "unit",     action: "Ghoul × 2",                                        priority: "critical",  iconKey: "ghoul" },
    { time: "1:30", type: "hero",     action: "Altar → Death Knight",                              priority: "critical",  iconSteps: [{ key: "altar_of_darkness", label: "Altar" }, { key: "death_knight", label: "Death Knight" }] },
    { time: "2:00", type: "hero",     action: "DK: Unholy Aura L1 — regen on all nearby units",   priority: "critical",  iconKey: "death_knight" },
    { time: "2:30", type: "unit",     action: "Graveyard → Crypt Fiend × 2",                      note: "Counter Flying Machines",              priority: "critical",  iconKey: "crypt_fiend" },
    { time: "3:00", type: "hero",     action: "DK: Death Coil L2 (heals Ghouls 400 HP mid-fight)", priority: "critical",  iconKey: "death_knight" },
    { time: "3:30", type: "building", action: "Haunted Gold Mine → Necromancer × 2",               priority: "critical",  iconKey: "haunted_mine" },
    { time: "4:00", type: "unit",     action: "Necromancer — Raise Dead from Footmen corpses",     priority: "critical",  iconKey: "necromancer" },
    { time: "4:30", type: "hero",     action: "Second hero: Dread Lord",                          note: "Vampiric Aura + lifesteal",             priority: "normal",    iconKey: "dread_lord" },
    { time: "5:00", type: "army",     action: "Fight: DK + Dread Lord + Ghouls + Crypt Fiend",    priority: "critical" },
    { time: "5:30", type: "unit",     action: "Banshee × 2 (Possess Knights in battle)",           priority: "normal",    iconKey: "banshee" },
    { time: "6:00", type: "unit",     action: "Abomination × 2 (Disease Cloud counters Priests)",  priority: "critical",  iconKey: "abomination" },
    { time: "7:00", type: "unit",     action: "Gargoyle × 2 if enemy goes heavy air",              priority: "optional",  iconKey: "gargoyle" },
  ],
  lateGame: "Destroyer counters Arcane Sanctum (devours magic). Frost Wyrm vs Gryphons. Banshee Possession on Knights permanently removes them. DK Animate Dead after big fights.",
  generalTips: [
    "Banshee Possession on a Knight = a Knight fighting for you — devastating.",
    "Web every Gryphon Rider immediately — grounded Gryphon is useless.",
    "Disease Cloud prevents Priest Heal from working effectively.",
    "Shade scouting reveals Paladin/Archmage positioning.",
  ],
};

const UNDEAD_VS_ORC: BuildOrder = {
  id: "undead_vs_orc",
  myRace: "undead",
  enemyRace: "orc",
  name: "Lich + Mass Undead — Siege and Sustain",
  style: "defensive",
  strategy: "Lich Frost Nova slows Orc army. Death Knight Unholy Aura sustains vs early pressure. Banshee Possess Taurens. Frost Wyrm sieges buildings.",
  difficulty: "intermediate",
  heroOrder: ["death_knight", "lich"],
  heroFirst: "death_knight",
  keyStrengths: ["Frost Nova slows Bloodlust Grunts", "Banshee can possess Taurens (huge swing)", "Frost Wyrm Freezing Breath slows everything"],
  keyWeaknesses: ["Orc physical pressure very early", "Shaman Purge removes Unholy Aura buff"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Acolytes",                                 priority: "critical",  iconKey: "acolyte" },
    { time: "0:30", type: "building", action: "Crypt + Altar + begin Necropolis upgrades",         priority: "critical",  iconSteps: [{ key: "crypt", label: "Crypt" }, { key: "altar_of_darkness", label: "Altar" }, { key: "necropolis", label: "Necropolis" }] },
    { time: "1:00", type: "unit",     action: "Ghoul × 3 (fast, good vs early Grunt)",             priority: "critical",  iconKey: "ghoul" },
    { time: "1:30", type: "hero",     action: "Altar → Death Knight",                              priority: "critical",  iconSteps: [{ key: "altar_of_darkness", label: "Altar" }, { key: "death_knight", label: "Death Knight" }] },
    { time: "2:00", type: "hero",     action: "DK Unholy Aura — Ghouls regen between fights",      priority: "critical",  iconKey: "death_knight" },
    { time: "2:30", type: "building", action: "Graveyard + Ziggurat → upgrade to Spirit Towers",   priority: "critical",  iconSteps: [{ key: "graveyard", label: "Graveyard" }, { key: "ziggurat", label: "Ziggurat" }] },
    { time: "3:00", type: "hero",     action: "Second hero: Lich",                                 note: "Frost Nova slows Bloodlust Grunts",     priority: "critical",  iconKey: "lich" },
    { time: "3:30", type: "unit",     action: "Necromancer × 2",                                  note: "Skeletons from Orc Grunt corpses",      priority: "critical",  iconKey: "necromancer" },
    { time: "4:00", type: "unit",     action: "Abomination × 2 (tanky frontline, Disease Cloud)",  priority: "critical",  iconKey: "abomination" },
    { time: "4:30", type: "unit",     action: "Banshee × 2 — Possess Taurens",                    note: "Best play vs Orc",                      priority: "critical",  iconKey: "banshee" },
    { time: "5:00", type: "army",     action: "Fight: DK + Lich + Ghouls + Abomination + Banshee", priority: "critical" },
    { time: "6:00", type: "unit",     action: "Frost Wyrm × 1 (siege Orc Barracks/Burrows)",       priority: "normal",    iconKey: "frost_wyrm" },
    { time: "7:00", type: "hero",     action: "Lich Death and Decay — siege Orc stronghold",       priority: "critical",  iconKey: "lich" },
  ],
  lateGame: "Lich Death and Decay destroys all Orc buildings from range. Banshee Possession of Tauren turns their best unit against them. Frost Wyrm Freezing Breath slows everything.",
  generalTips: [
    "Possess the Tauren immediately in fights — losing a Tauren is devastating for Orc.",
    "Lich Frost Armor on Ghouls halves melee attack speed of attacking Grunts.",
    "Spread Ghouls so Tauren Pulverize doesn't splash all of them.",
    "Shade scout reveals Blademaster location — protects workers from Wind Walk.",
  ],
};

const UNDEAD_VS_NIGHTELF: BuildOrder = {
  id: "undead_vs_nightelf",
  myRace: "undead",
  enemyRace: "nightelf",
  name: "Dread Lord + Crypt Fiends — Web and Attrition",
  style: "standard",
  strategy: "Crypt Fiend Web grounds all NE flyers. Dread Lord Sleep disables Demon Hunter. Necromancer skeletons overwhelm NE light armor.",
  difficulty: "intermediate",
  heroOrder: ["dread_lord", "death_knight"],
  heroFirst: "dread_lord",
  keyStrengths: ["Web grounds Hippogryph/Chimaera/Faerie Dragon", "Necromancer skeletons from NE corpses", "Gargoyle vs Chimaera in air battle"],
  keyWeaknesses: ["Dryad Abolish Magic destroys skeleton armies", "DH Mana Burn cripples casters"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Acolytes",                                 priority: "critical",  iconKey: "acolyte" },
    { time: "0:30", type: "building", action: "Crypt + Altar",                                     priority: "critical",  iconSteps: [{ key: "crypt", label: "Crypt" }, { key: "altar_of_darkness", label: "Altar" }] },
    { time: "1:00", type: "unit",     action: "Ghoul × 2 (fast, good vs Archers/Huntresses)",      priority: "critical",  iconKey: "ghoul" },
    { time: "1:30", type: "hero",     action: "Altar → Dread Lord",                                priority: "critical",  iconSteps: [{ key: "altar_of_darkness", label: "Altar" }, { key: "dread_lord", label: "Dread Lord" }] },
    { time: "2:00", type: "hero",     action: "DL: Vampiric Aura L1 — Ghouls heal through fights", priority: "critical",  iconKey: "dread_lord" },
    { time: "2:30", type: "unit",     action: "Graveyard → Crypt Fiend × 3 (Web all NE flyers)",  priority: "critical",  iconKey: "crypt_fiend" },
    { time: "3:00", type: "hero",     action: "Dread Lord Sleep — disable DH",                    note: "His Mana Burn is deadly",               priority: "critical",  iconKey: "dread_lord" },
    { time: "3:30", type: "hero",     action: "Second hero: Death Knight",                        note: "DK + DL dual aura = massive sustain",   priority: "critical",  iconKey: "death_knight" },
    { time: "4:00", type: "unit",     action: "Necromancer × 2 (Raise Dead from NE corpses)",     priority: "critical",  iconKey: "necromancer" },
    { time: "4:30", type: "unit",     action: "Abomination × 1 (Dryad can't kill heavy armor easily)", priority: "normal", iconKey: "abomination" },
    { time: "5:00", type: "army",     action: "Fight: DL + DK + Ghouls + Crypt Fiend + Necro",    priority: "critical" },
    { time: "5:30", type: "unit",     action: "Gargoyle × 3 if NE heavy air",                     priority: "normal",    iconKey: "gargoyle" },
    { time: "6:30", type: "unit",     action: "Destroyer × 1 (Devour Magic vs Faerie Dragon)",     priority: "optional",  iconKey: "destroyer" },
  ],
  lateGame: "Crypt Fiend Web grounds all Chimaeras — massed Ghouls destroy them on ground. Destroyer devours Dryad and Druid spell effects. DK Animate Dead from NE graveyard.",
  generalTips: [
    "Web the DH immediately — grounded DH loses Immolation AoE.",
    "Sleep the Keeper of the Grove — prevents Entangle and Tranquility channeling.",
    "Crypt Fiend piercing attack is strong vs NE light armor.",
    "Gargoyle Stone Form when targeted heavily — regenerate then rejoin.",
  ],
};

const UNDEAD_VS_UNDEAD: BuildOrder = {
  id: "undead_vs_undead",
  myRace: "undead",
  enemyRace: "undead",
  name: "Lich + Crypt Fiends — Creep and Scale",
  style: "economic",
  strategy: "Lich provides consistent AoE damage. Crypt Fiend heavy armor wins attrition wars. Shade scouting is essential in mirror.",
  difficulty: "intermediate",
  heroOrder: ["lich", "death_knight"],
  heroFirst: "lich",
  keyStrengths: ["Crypt Fiend heavy armor trades well", "Lich Frost Nova vs grouped Ghouls", "Shade scouting reveals enemy build"],
  keyWeaknesses: ["Mirror rewards economy and creeping", "Both sides have similar sustain"],
  steps: [
    { time: "0:00", type: "worker",   action: "Train 3 Acolytes",                                 priority: "critical",  iconKey: "acolyte" },
    { time: "0:30", type: "building", action: "Crypt + Altar + Haunted Gold Mine expansion",       priority: "critical",  iconSteps: [{ key: "crypt", label: "Crypt" }, { key: "altar_of_darkness", label: "Altar" }, { key: "haunted_mine", label: "Gold Mine" }] },
    { time: "1:00", type: "unit",     action: "Ghoul × 2, then switch to Crypt Fiend",            priority: "critical",  iconKey: "ghoul" },
    { time: "1:30", type: "hero",     action: "Altar → Lich (Frost Nova AoE vs Ghoul armies)",    priority: "critical",  iconSteps: [{ key: "altar_of_darkness", label: "Altar" }, { key: "lich", label: "Lich" }] },
    { time: "2:00", type: "unit",     action: "Shade × 1 — permanent invisible scout",            note: "See enemy strategy + expansion",       priority: "critical",  iconKey: "shade" },
    { time: "2:30", type: "hero",     action: "Lich: Frost Nova L1, Dark Ritual L1",               priority: "critical",  iconKey: "lich" },
    { time: "3:00", type: "unit",     action: "Crypt Fiend × 3 (heavy armor wins attrition)",      priority: "critical",  iconKey: "crypt_fiend" },
    { time: "3:30", type: "research", action: "Crypt Fiend Burrow — heal out of combat",           priority: "normal" },
    { time: "4:00", type: "hero",     action: "Second hero: Death Knight (Unholy Aura regen)",     priority: "critical",  iconKey: "death_knight" },
    { time: "4:30", type: "unit",     action: "Necromancer × 2 (skeleton fodder wins attrition)",  priority: "normal",    iconKey: "necromancer" },
    { time: "5:00", type: "unit",     action: "Abomination × 2 (heavy armor frontline)",           priority: "critical",  iconKey: "abomination" },
    { time: "6:00", type: "army",     action: "Lich Death and Decay + Meat Wagon — siege Necropolis", priority: "critical" },
    { time: "7:00", type: "unit",     action: "Frost Wyrm × 1 if enemy has strong structures",    priority: "optional",  iconKey: "frost_wyrm" },
  ],
  lateGame: "Lich Death and Decay + Frost Wyrm siege destroys enemy base. Crypt Fiend Burrow micro is essential — pull injured units underground to heal.",
  generalTips: [
    "Shade scouting is critical in Undead mirror — see every expansion.",
    "Lich Dark Ritual on low-HP Ghouls sustains full mana for Frost Nova spam.",
    "Crypt Fiend Burrow to heal between fights — much better attrition than Ghouls.",
    "Death and Decay is the best siege tool — use it to destroy expansions.",
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const ALL_BUILD_ORDERS: BuildOrder[] = [
  HUMAN_VS_HUMAN,
  HUMAN_VS_ORC,
  HUMAN_VS_NIGHTELF,
  HUMAN_VS_UNDEAD,
  ORC_VS_HUMAN_BM,
  ORC_VS_HUMAN_FS,
  ORC_VS_ORC,
  ORC_VS_NIGHTELF_TC,
  ORC_VS_NIGHTELF_FS,
  ORC_VS_UNDEAD,
  NIGHTELF_VS_HUMAN,
  NIGHTELF_VS_ORC,
  NIGHTELF_VS_NIGHTELF,
  NIGHTELF_VS_UNDEAD,
  UNDEAD_VS_HUMAN,
  UNDEAD_VS_ORC,
  UNDEAD_VS_NIGHTELF,
  UNDEAD_VS_UNDEAD,
];

/** Returns all build orders for a matchup (multiple if available). */
export function getBuildOrders(myRace: Race, enemyRace: Race): BuildOrder[] {
  return ALL_BUILD_ORDERS.filter(
    (bo) => bo.myRace === myRace && bo.enemyRace === enemyRace
  );
}

/** @deprecated use getBuildOrders */
export function getBuildOrder(myRace: Race, enemyRace: Race): BuildOrder | undefined {
  return getBuildOrders(myRace, enemyRace)[0];
}

export const STEP_TYPE_CONFIG: Record<BuildStepType, {
  emoji: string;
  label: string;
  textColor: string;
  bgColor: string;
  dotColor: string;
  borderColor: string;
}> = {
  worker:   { emoji: "⛏",  label: "Worker",   textColor: "text-amber-300",   bgColor: "bg-amber-500/10",   dotColor: "bg-amber-400",   borderColor: "border-amber-500/30" },
  building: { emoji: "🏛",  label: "Building", textColor: "text-blue-300",    bgColor: "bg-blue-500/10",    dotColor: "bg-blue-400",    borderColor: "border-blue-500/30" },
  tech:     { emoji: "⬆",  label: "Tech Up",  textColor: "text-cyan-300",    bgColor: "bg-cyan-500/10",    dotColor: "bg-cyan-400",    borderColor: "border-cyan-500/30" },
  unit:     { emoji: "⚔",  label: "Unit",     textColor: "text-emerald-300", bgColor: "bg-emerald-500/10", dotColor: "bg-emerald-400", borderColor: "border-emerald-500/30" },
  hero:     { emoji: "★",  label: "Hero",     textColor: "text-yellow-300",  bgColor: "bg-yellow-500/10",  dotColor: "bg-yellow-400",  borderColor: "border-yellow-500/30" },
  research: { emoji: "◆",  label: "Research", textColor: "text-purple-300",  bgColor: "bg-purple-500/10",  dotColor: "bg-purple-400",  borderColor: "border-purple-500/30" },
  expand:   { emoji: "⬡",  label: "Expand",   textColor: "text-teal-300",    bgColor: "bg-teal-500/10",    dotColor: "bg-teal-400",    borderColor: "border-teal-500/30" },
  army:     { emoji: "►",  label: "Attack",   textColor: "text-red-300",     bgColor: "bg-red-500/10",     dotColor: "bg-red-400",     borderColor: "border-red-500/30" },
};

export const STYLE_CONFIG: Record<BuildStyle, { label: string; badgeClass: string }> = {
  aggressive: { label: "Aggressive", badgeClass: "bg-red-500/10 border-red-500/30 text-red-400" },
  defensive:  { label: "Defensive",  badgeClass: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  economic:   { label: "Economic",   badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  standard:   { label: "Standard",   badgeClass: "bg-white/[0.06] border-white/[0.12] text-white/50" },
};

export const DIFFICULTY_CONFIG: Record<BuildOrder["difficulty"], { label: string; badgeClass: string }> = {
  beginner:     { label: "Beginner",     badgeClass: "bg-green-500/10 border-green-500/30 text-green-400" },
  intermediate: { label: "Intermediate", badgeClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  advanced:     { label: "Advanced",     badgeClass: "bg-red-500/10 border-red-500/30 text-red-400" },
};

export const DIFFICULTY_LABELS: Record<BuildOrder["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_COLORS: Record<BuildOrder["difficulty"], string> = {
  beginner: "text-green-400 border-green-600",
  intermediate: "text-yellow-400 border-yellow-600",
  advanced: "text-red-400 border-red-600",
};
