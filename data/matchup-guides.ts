export interface GuideLink {
  title: string;
  url: string;
  source: "WC3 Gym" | "warcraft3.info";
  summary: string;
}

/** Keyed as "myRace_vs_enemyRace". Includes both directions where guides exist. */
export const MATCHUP_GUIDES: Record<string, GuideLink[]> = {
  undead_vs_human: [
    {
      title: "Fighting Paladin Rifle as UD",
      url: "https://warcraft-gym.com/fighting-paladin-rifle-as-ud-a-no-hands-guide-by-kaiser/",
      source: "WC3 Gym",
      summary: "Three approaches to beat Paladin Rifle: fast expo mass ghouls, DK/Pit Lord, and one-base DK/PL.",
    },
    {
      title: "Facing Paladin Rifle as Undead",
      url: "https://warcraft-gym.com/facing-paladin-rifle-as-undead/",
      source: "WC3 Gym",
      summary: "Scouting tells and counter-tech options vs the Human meta staple.",
    },
  ],
  undead_vs_nightelf: [
    {
      title: "Death Knight and Ghoul Tech vs. DH Naga/Panda 1 Base",
      url: "https://warcraft-gym.com/death-knight-and-ghoul-tech-vs-dh-naga-panda-1-base/",
      source: "WC3 Gym",
      summary: "Early DK pressure to deny NE 1-base DH openings.",
    },
  ],
  undead_vs_orc: [
    {
      title: "Undead Fast DK vs. Blade Master Tips",
      url: "https://warcraft-gym.com/undead-fast-dk-vs-blade-master-tips/",
      source: "WC3 Gym",
      summary: "Managing early BM harass as Undead with fast DK responses.",
    },
    {
      title: "FS or BM Against UD — Brains vs Brawns",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Orc perspective: Far Seer vs Blade Master decision tree in the UD matchup.",
    },
  ],
  orc_vs_undead: [
    {
      title: "FS or BM Against UD — Brains vs Brawns",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Choosing between Far Seer and Blade Master based on Undead scouting info.",
    },
    {
      title: "Pit Lord Fast T3 Necro Wagon Push",
      url: "https://warcraft-gym.com/pit-lord-fast-t3-necro-wagon-push/",
      source: "WC3 Gym",
      summary: "Aggressive Pit Lord + T3 timing push to overwhelm Undead before lategame.",
    },
  ],
  orc_vs_human: [
    {
      title: "Orc Army Compositions — Don't Bring A Blade To A Riflefight",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Which Orc unit compositions work vs Human rifles and when to adapt.",
    },
    {
      title: "Quick Headhunters and Slow Tauren Chieftain",
      url: "https://warcraft-gym.com/quick-headhunters-and-slow-tauren-chieftain/",
      source: "WC3 Gym",
      summary: "Fast Headhunter opener with delayed TC — beats Human early pressure.",
    },
  ],
  orc_vs_nightelf: [
    {
      title: "Mass Talons Versus Orc",
      url: "https://warcraft-gym.com/mass-talons-versus-orc/",
      source: "WC3 Gym",
      summary: "Night Elf mass Talon perspective — useful for Orc players to understand the NE strategy they will face.",
    },
    {
      title: "Tier 2 FS/Naga Push vs NE",
      url: "https://warcraft-gym.com/tier-2-fs-naga-push-vs-ne/",
      source: "WC3 Gym",
      summary: "Aggressive Orc T2 Far Seer + Naga timing attack into Night Elf base.",
    },
  ],
  orc_vs_orc: [
    {
      title: "Orc Mirror — The Playbook",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Small tricks and edge plays for Orc mirror matchups.",
    },
    {
      title: "Mirror, Mirror — Orc",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Off-meta Far Seer + upgraded Headhunters strategy for OvO mirror.",
    },
  ],
  nightelf_vs_nightelf: [
    {
      title: "Mirror, Mirror — Night Elf",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Archers + Talons off-meta mirror strategy vs standard DH opening.",
    },
    {
      title: "Night Elf's 24 Food Proxy Expo",
      url: "https://warcraft-gym.com/night-elfs-24-food-proxy-expo/",
      source: "WC3 Gym",
      summary: "Fast expansion technique using minimal food for maximum map presence.",
    },
  ],
  nightelf_vs_orc: [
    {
      title: "Mass Talons Versus Orc",
      url: "https://warcraft-gym.com/mass-talons-versus-orc/",
      source: "WC3 Gym",
      summary: "Scaling mass Druid of the Talon with Cyclone and Faerie Fire to counter Orc melee.",
    },
  ],
  nightelf_vs_human: [
    {
      title: "Beginner Guide: Rifle Caster",
      url: "https://warcraft-gym.com/beginner-guide-rifle-caster/",
      source: "WC3 Gym",
      summary: "Understanding the Human Rifle-Caster comp you will face — useful for NE counter-play.",
    },
  ],
  undead_vs_undead: [
    {
      title: "Mirror, Mirror — Undead",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Lich-first Ghouls, Gargoyles, and Frost Wyrms as an off-meta UvU strategy.",
    },
    {
      title: "Crypt Lord Fast Fiends With Fast Tech",
      url: "https://warcraft-gym.com/crypt-lord-fast-fiends-with-fast-tech/",
      source: "WC3 Gym",
      summary: "Aggressive CL opener into fast Fiend tech for UvU pressure.",
    },
  ],
  human_vs_undead: [
    {
      title: "Standard Human Mirror Guide",
      url: "https://warcraft-gym.com/standard-human-mirror-guide/",
      source: "WC3 Gym",
      summary: "Human fundamentals applicable to the UD matchup — caster management and Paladin usage.",
    },
    {
      title: "The Pala, the Rifle, and the Blond Devil",
      url: "https://warcraft3.info/strategy",
      source: "warcraft3.info",
      summary: "Deep dive into Paladin Rifle strengths, weaknesses, and balance discussion.",
    },
  ],
  human_vs_human: [
    {
      title: "Standard Human Mirror Guide",
      url: "https://warcraft-gym.com/standard-human-mirror-guide/",
      source: "WC3 Gym",
      summary: "Full walkthrough of HvH mirror: opening, caster management, and transitions.",
    },
    {
      title: "Solo Paladin Baptism Build",
      url: "https://warcraft-gym.com/solo-paladin-baptism-build/",
      source: "WC3 Gym",
      summary: "Aggressive single-Paladin rush style for the Human mirror.",
    },
    {
      title: "MK 2 Barracks Footmen Tower Rush",
      url: "https://warcraft-gym.com/mk-2-barracks-footmen-tower-rush/",
      source: "WC3 Gym",
      summary: "Early Mountain King tower rush in the HvH mirror.",
    },
  ],
  human_vs_orc: [
    {
      title: "Human Base Building Guide",
      url: "https://warcraft-gym.com/human-base-building-guide/",
      source: "WC3 Gym",
      summary: "Defensive base layouts and timing benchmarks relevant to Human vs Orc.",
    },
  ],
  human_vs_nightelf: [
    {
      title: "Archmage First One Creep Camp into Expansion",
      url: "https://warcraft-gym.com/archmage-first-one-creep-camp-into-expansion/",
      source: "WC3 Gym",
      summary: "AM-first fast expansion strategy — a common Human response to NE early pressure.",
    },
  ],
};

export function getMatchupGuides(myRace: string, enemyRace: string): GuideLink[] {
  const key = `${myRace}_vs_${enemyRace}`;
  return MATCHUP_GUIDES[key] ?? [];
}
