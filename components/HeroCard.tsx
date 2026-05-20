"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroMatchupScore } from "@/lib/matchup-engine";
import { HERO_ROLE_LABELS } from "@/data/heroes";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getHeroIcon } from "@/data/icons";
import { cn } from "@/lib/utils";

const REC_STYLES: Record<HeroMatchupScore["recommendation"], { border: string; badge: string; label: string }> = {
  primary:     { border: "border-amber-500/40",  badge: "text-amber-400",  label: "Primary Pick" },
  secondary:   { border: "border-white/[0.10]",  badge: "text-white/50",   label: "Secondary" },
  situational: { border: "border-white/[0.06]",  badge: "text-white/30",   label: "Situational" },
};

interface HeroCardProps {
  score: HeroMatchupScore;
  rank?: number;
}

export function HeroCard({ score, rank }: HeroCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { hero, strongPoints, weakPoints, recommendation } = score;
  const style = REC_STYLES[recommendation];

  return (
    <div className={cn("rounded-2xl border bg-white/[0.03] transition-all duration-150", style.border)}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          {/* Hero icon */}
          <div className="relative flex-shrink-0 h-14 w-14 overflow-hidden rounded-xl border border-white/10">
            <Image src={getHeroIcon(hero.id)} alt={hero.name} fill className="object-cover" unoptimized />
            {rank && (
              <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                {rank}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-base text-white leading-tight">{hero.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/35">
                  <span>{HERO_ROLE_LABELS[hero.role]}</span>
                  <span>·</span>
                  <span>{ATTACK_TYPE_LABELS[hero.attackType]}</span>
                  <span>·</span>
                  <span>{hero.range}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("text-[11px] font-medium", style.badge)}>{style.label}</span>
                <span className={cn("text-white/25 text-xs transition-transform duration-200", expanded && "rotate-180")}>▼</span>
              </div>
            </div>

            {strongPoints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {strongPoints.slice(0, 2).map((pt) => (
                  <span key={pt} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400/80">
                    {pt.length > 45 ? pt.slice(0, 45) + "…" : pt}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 text-xs space-y-4">
          <p className="text-white/50 leading-relaxed">{hero.description}</p>

          {/* Abilities */}
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-2">Abilities</p>
            <div className="space-y-2">
              {hero.abilities.map((ability) => (
                <div key={ability.name} className="rounded-xl bg-white/[0.04] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white/80">{ability.name}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] border",
                      ability.type === "ultimate" ? "text-red-400 border-red-500/30 bg-red-500/10" :
                      ability.type === "aura"     ? "text-purple-400 border-purple-500/30 bg-purple-500/10" :
                      ability.type === "passive"  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
                      "text-blue-400 border-blue-500/30 bg-blue-500/10"
                    )}>
                      {ability.type}
                    </span>
                  </div>
                  <p className="text-white/40 leading-relaxed">{ability.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {strongPoints.length > 0 && (
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1.5">Strengths</p>
                <ul className="space-y-1">
                  {strongPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-1.5 text-emerald-400/70">
                      <span className="mt-0.5 flex-shrink-0">+</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {weakPoints.length > 0 && (
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1.5">Watch out for</p>
                <ul className="space-y-1">
                  {weakPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-1.5 text-red-400/70">
                      <span className="mt-0.5 flex-shrink-0">!</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {hero.tips.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1.5">Tips</p>
              <ul className="space-y-1">
                {hero.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-white/40">
                    <span className="text-amber-500/50 mt-0.5 flex-shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-white/30">
            <span>HP: <span className="text-white/50">{hero.baseHP}</span></span>
            <span>Armor: <span className="text-white/50">{ARMOR_TYPE_LABELS[hero.armorType]}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
