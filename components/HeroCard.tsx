"use client";

import Image from "next/image";
import type { HeroMatchupScore } from "@/lib/matchup-engine";
import { HERO_ROLE_LABELS, type Hero } from "@/data/heroes";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getHeroIcon, getAbilityIconCandidates } from "@/data/icons";
import { IconWithFallback } from "@/components/UnitDetailContent";
import { cn } from "@/lib/utils";

const REC_STYLES: Record<HeroMatchupScore["recommendation"], { border: string; activeBorder: string; label: string; labelColor: string }> = {
  primary:     { border: "border-amber-500/40",  activeBorder: "border-amber-500/60",  label: "Primary",     labelColor: "text-amber-400"  },
  secondary:   { border: "border-white/[0.10]",  activeBorder: "border-white/[0.20]",  label: "Secondary",   labelColor: "text-white/45"   },
  situational: { border: "border-white/[0.06]",  activeBorder: "border-white/[0.14]",  label: "Situational", labelColor: "text-white/25"   },
};

interface HeroCardProps {
  score: HeroMatchupScore;
  expanded: boolean;
  onToggle: () => void;
}

function StatPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-[11px]">
      <span className="text-white/35 shrink-0">{label}</span>
      <span className="text-white/75 text-right">{value}</span>
    </div>
  );
}

function HeroAbilityBlock({ ability }: { ability: Hero["abilities"][number] }) {
  const candidates = getAbilityIconCandidates(undefined, ability.name);
  const typeColors: Record<string, string> = {
    ultimate: "text-red-400/80",
    aura:     "text-purple-400/80",
    passive:  "text-emerald-400/80",
  };
  return (
    <div className="border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <IconWithFallback candidates={candidates} alt={ability.name} size={24} />
        <span className="font-semibold text-xs text-white/85 flex-1 min-w-0">{ability.name}</span>
        <span className={cn("font-mono text-[10px] tracking-[0.1em] uppercase flex-shrink-0", typeColors[ability.type] ?? "text-blue-400/70")}>
          {ability.type}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] text-white/50 leading-relaxed">{ability.description}</p>
        {ability.levels > 1 && (
          <p className="mt-1 font-mono text-[10px] text-white/25">{ability.levels} levels</p>
        )}
      </div>
    </div>
  );
}

/** Compact portrait card — equal-height, no variable content */
export function HeroCard({ score, expanded, onToggle }: HeroCardProps) {
  const { hero, strongPoints, recommendation } = score;
  const style = REC_STYLES[recommendation];

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full text-left border bg-white/[0.03] overflow-hidden transition-colors duration-150",
        expanded ? style.activeBorder : style.border,
        !expanded && "hover:bg-white/[0.05]"
      )}
    >
      {/* Horizontal layout: portrait left, info right */}
      <div className="flex items-stretch gap-0">

        {/* Portrait — fixed square, left-aligned */}
        <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden">
          <Image src={getHeroIcon(hero.id)} alt={hero.name} fill className="object-cover object-top" unoptimized />
          {expanded && <div className="absolute inset-0 bg-amber-500/[0.10]" />}
        </div>

        {/* Info — right of portrait */}
        <div className="flex-1 min-w-0 px-2.5 py-2 flex flex-col justify-center gap-0.5">
          <p
            style={{ fontFamily: "var(--font-cinzel)" }}
            className="text-[11px] font-bold text-white leading-tight truncate"
          >
            {hero.name}
          </p>
          <p className="font-mono text-[10px] text-white/30 truncate">
            {HERO_ROLE_LABELS[hero.role]}
          </p>
          <span className={cn("font-mono text-[9px] tracking-[0.1em] uppercase mt-0.5", style.labelColor)}>
            {style.label}
          </span>
        </div>
      </div>
    </button>
  );
}

/** Full expanded panel — rendered outside the card strip */
export function HeroExpandedPanel({ score }: { score: HeroMatchupScore }) {
  const { hero, strongPoints, weakPoints } = score;

  return (
    <div className="border border-white/[0.09] bg-white/[0.02] px-5 py-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-5 pb-4 border-b border-white/[0.06]">
        <div>
          <p
            style={{ fontFamily: "var(--font-cinzel)" }}
            className="text-base font-black text-white leading-tight"
          >
            {hero.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-white/30">
            <span>{HERO_ROLE_LABELS[hero.role]}</span>
            <span>·</span>
            <span>{ATTACK_TYPE_LABELS[hero.attackType]}</span>
            <span>·</span>
            <span>{hero.range}</span>
          </div>
        </div>
        {hero.description && (
          <p className="text-xs text-white/40 leading-relaxed hidden md:block max-w-md text-right">
            {hero.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Col 1: Stats */}
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/28 mb-2.5">Stats</p>
            <div className="space-y-1 border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <StatPair label="HP"      value={<span className="text-emerald-400">{hero.baseHP}</span>} />
              <StatPair label="Mana"    value={<span className="text-blue-400">{hero.baseMana}</span>} />
              <StatPair label="Damage"  value={<span className="text-red-400/90">{hero.baseDamage}</span>} />
              <StatPair label="Attack"  value={ATTACK_TYPE_LABELS[hero.attackType]} />
              <StatPair label="Armor"   value={ARMOR_TYPE_LABELS[hero.armorType]} />
              <StatPair label="Range"   value={hero.range} />
              <StatPair label="Speed"   value={hero.speed} />
              <StatPair label="Primary" value={<span className="capitalize">{hero.primaryStat}</span>} />
            </div>
          </div>

          {/* Strengths + weaknesses */}
          {strongPoints.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/28 mb-2">Strengths</p>
              <div className="space-y-1">
                {strongPoints.map((pt) => (
                  <div key={pt} className="flex items-start gap-1.5 text-[11px] text-emerald-400/65">
                    <span className="font-mono flex-shrink-0">+</span>{pt}
                  </div>
                ))}
              </div>
            </div>
          )}
          {weakPoints.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/28 mb-2">Watch out for</p>
              <div className="space-y-1">
                {weakPoints.map((pt) => (
                  <div key={pt} className="flex items-start gap-1.5 text-[11px] text-red-400/65">
                    <span className="font-mono flex-shrink-0">!</span>{pt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Col 2–3: Abilities */}
        <div className="md:col-span-2 space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/28 mb-2.5">Abilities</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hero.abilities.map((ability) => (
              <HeroAbilityBlock key={ability.name} ability={ability} />
            ))}
          </div>

          {hero.tips.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/28 mb-2">Tips</p>
              <div className="space-y-1.5">
                {hero.tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-2 text-[11px] text-white/40 leading-relaxed">
                    <span className="flex-shrink-0 text-amber-500/40 font-mono">→</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
