"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroMatchupScore } from "@/lib/matchup-engine";
import { HERO_ROLE_LABELS, HERO_ROLE_COLORS } from "@/data/heroes";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getHeroIcon } from "@/data/icons";
import { cn } from "@/lib/utils";

const RECOMMENDATION_STYLES: Record<HeroMatchupScore["recommendation"], { border: string; badge: string; label: string }> = {
  primary:    { border: "border-amber-700", badge: "bg-amber-900/50 text-amber-400 border-amber-700", label: "★ Primary Pick" },
  secondary:  { border: "border-yellow-800", badge: "bg-yellow-900/40 text-yellow-500 border-yellow-800", label: "✓ Secondary Pick" },
  situational:{ border: "border-slate-700", badge: "bg-slate-800/40 text-slate-400 border-slate-700", label: "~ Situational" },
};

interface HeroCardProps {
  score: HeroMatchupScore;
  rank?: number;
}

export function HeroCard({ score, rank }: HeroCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { hero, strongPoints, weakPoints, recommendation } = score;
  const style = RECOMMENDATION_STYLES[recommendation];

  return (
    <div className={cn("rounded-lg border bg-black/40 transition-all duration-200", style.border)}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          {/* Hero icon */}
          <div className="relative flex-shrink-0 h-14 w-14 overflow-hidden rounded-lg border-2 border-amber-800/60 shadow-lg shadow-amber-950/50">
            <Image src={getHeroIcon(hero.id)} alt={hero.name} fill className="object-cover" unoptimized />
            {rank && (
              <div className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black shadow">
                {rank}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-200 text-lg">{hero.name}</span>
              <span className={cn("text-xs font-bold", HERO_ROLE_COLORS[hero.role])}>
                {HERO_ROLE_LABELS[hero.role]}
              </span>
              <span className={cn("text-xs border rounded-full px-2 py-0.5", style.badge)}>
                {style.label}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{ATTACK_TYPE_LABELS[hero.attackType]} attack</span>
              <span>•</span>
              <span>{ARMOR_TYPE_LABELS[hero.armorType]} armor</span>
              <span>•</span>
              <span>{hero.range}</span>
              <span>•</span>
              <span>HP: {hero.baseHP}</span>
            </div>
          </div>
          <div className="text-xs text-slate-600">{expanded ? "▲" : "▼"}</div>
        </div>

        {/* Strong points preview */}
        {strongPoints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {strongPoints.slice(0, 2).map((pt) => (
              <span
                key={pt}
                className="rounded-full bg-green-950/60 border border-green-900 px-2 py-0.5 text-xs text-green-400"
              >
                {pt.length > 50 ? pt.slice(0, 50) + "..." : pt}
              </span>
            ))}
          </div>
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-800 px-4 pb-4 pt-3 text-xs space-y-4">
          <p className="text-slate-400">{hero.description}</p>

          {/* Abilities */}
          <div>
            <div className="font-bold text-amber-600 mb-2">Abilities</div>
            <div className="space-y-2">
              {hero.abilities.map((ability) => (
                <div key={ability.name} className="rounded bg-black/30 p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-amber-300">{ability.name}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] border",
                      ability.type === "ultimate" ? "text-red-400 border-red-800 bg-red-950/50" :
                      ability.type === "aura" ? "text-purple-400 border-purple-800 bg-purple-950/50" :
                      ability.type === "passive" ? "text-green-400 border-green-800 bg-green-950/50" :
                      "text-blue-400 border-blue-800 bg-blue-950/50"
                    )}>
                      {ability.type}
                    </span>
                    <span className="text-slate-600">{ability.levels} lvl{ability.levels > 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-slate-500">{ability.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Matchup tips */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {strongPoints.length > 0 && (
              <div>
                <div className="font-bold text-green-600 mb-1">Strengths in this matchup</div>
                <ul className="space-y-1">
                  {strongPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-1.5 text-green-400/80">
                      <span className="mt-0.5 text-green-600">+</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {weakPoints.length > 0 && (
              <div>
                <div className="font-bold text-red-600 mb-1">Watch out for</div>
                <ul className="space-y-1">
                  {weakPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-1.5 text-red-400/80">
                      <span className="mt-0.5 text-red-600">!</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Hero tips */}
          {hero.tips.length > 0 && (
            <div>
              <div className="font-bold text-amber-600 mb-1">General Tips</div>
              <ul className="space-y-1">
                {hero.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-amber-700 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
