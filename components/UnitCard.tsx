"use client";

import Image from "next/image";
import type { UnitMatchupScore } from "@/lib/matchup-engine";
import { getRecommendationLabel, getRecommendationColor, getScoreBadgeColor } from "@/lib/matchup-engine";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getUnitIcon } from "@/data/icons";
import { cn } from "@/lib/utils";

interface UnitCardProps {
  score: UnitMatchupScore;
  expanded: boolean;
  onToggle: () => void;
}

export function UnitCard({ score, expanded, onToggle }: UnitCardProps) {
  const { unit, offensiveScore, defensiveScore, overallScore, effectivenessVsEnemyUnits, explanation, recommendation } = score;
  const pct = Math.round(overallScore * 100);

  const borderColor = {
    highly_recommended: "border-emerald-500/30",
    recommended:        "border-amber-500/20",
    situational:        "border-white/[0.08]",
    avoid:              "border-red-500/20",
  }[recommendation];

  return (
    <div className={cn("rounded-2xl border bg-white/[0.03] transition-all duration-150", borderColor, expanded && "md:col-span-2")}>
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 h-10 w-10 overflow-hidden border border-white/10">
            <Image src={getUnitIcon(unit.id)} alt={unit.name} fill className="object-cover" unoptimized />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-white">{unit.name}</span>
              <span className={cn("text-[11px] font-medium", getRecommendationColor(recommendation))}>
                {getRecommendationLabel(recommendation)}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-white/35">
              <span>T{unit.tier}</span>
              <span>·</span>
              <span>{ATTACK_TYPE_LABELS[unit.attackType]}</span>
              <span>·</span>
              <span>{ARMOR_TYPE_LABELS[unit.armorType]}</span>
              <span>·</span>
              <span>{unit.goldCost}g</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold border", getScoreBadgeColor(overallScore))}>
              {pct}%
            </span>
            <span className={cn("text-white/25 text-xs transition-transform duration-200", expanded && "rotate-180")}>
              ▼
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {[
            { label: "Offense", val: offensiveScore, color: "bg-emerald-500", textColor: "text-emerald-500" },
            { label: "Defense", val: defensiveScore, color: "bg-blue-500", textColor: "text-blue-500" },
          ].map(({ label, val, color, textColor }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-10 sm:w-12 text-[11px] ${textColor}`}>{label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.08]">
                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(val * 70, 100)}%` }} />
              </div>
              <span className="w-7 text-right text-[11px] text-white/40">{Math.round(val * 100)}%</span>
            </div>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-3 sm:px-4 pb-4 pt-3 text-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left col: Explanation + Abilities + Stats + Overview */}
            <div className="space-y-4">
              <p className="text-white/60 leading-relaxed">{explanation}</p>
              {unit.special.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-2">Abilities</p>
                  <ul className="space-y-1">
                    {unit.special.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-white/50">
                        <span className="text-amber-500/60 mt-0.5 flex-shrink-0">·</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1.5">Stats</p>
                <div className="space-y-0.5 text-white/40">
                  <div>HP <span className="text-emerald-400">{unit.hp}</span></div>
                  <div>Dmg <span className="text-red-400">{unit.damage}</span></div>
                  <div>Food <span className="text-amber-400">{unit.foodCost}</span></div>
                  <div>Speed <span className="text-white/60">{unit.speed}</span></div>
                </div>
              </div>
              {unit.description && (
                <div>
                  <p className="text-[11px] font-medium tracking-widests uppercase text-white/40 mb-1.5">Overview</p>
                  <p className="text-white/40 leading-relaxed">{unit.description}</p>
                </div>
              )}
            </div>

            {/* Right col: Effectiveness vs Enemy */}
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-2">Effectiveness vs Enemy</p>
              <div className="flex flex-col gap-1">
                {[...effectivenessVsEnemyUnits]
                  .sort((a, b) => b.multiplier - a.multiplier)
                  .map(({ enemyUnit, multiplier }) => (
                  <div key={enemyUnit.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2 py-1.5 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="relative flex-shrink-0 h-6 w-6 overflow-hidden">
                        <Image src={getUnitIcon(enemyUnit.id)} alt={enemyUnit.name} fill className="object-cover" unoptimized />
                      </div>
                      <span className="text-white/50 truncate text-[11px]">{enemyUnit.name}</span>
                    </div>
                    <span className={cn(
                      "font-semibold flex-shrink-0 text-[11px]",
                      multiplier >= 1.5 ? "text-emerald-400" :
                      multiplier >= 1.0 ? "text-amber-400" : "text-red-400"
                    )}>
                      {Math.round(multiplier * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
