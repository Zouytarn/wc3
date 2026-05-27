"use client";

import Image from "next/image";
import type { UnitMatchupScore } from "@/lib/matchup-engine";
import { getRecommendationLabel, getRecommendationColor, getScoreBadgeColor } from "@/lib/matchup-engine";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getUnitIcon } from "@/data/icons";
import { UnitTooltip } from "@/components/UnitTooltip";
import { UnitDetailContent } from "@/components/UnitDetailContent";
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
    highly_recommended: "border-emerald-500/35",
    recommended:        "border-amber-500/25",
    situational:        "border-white/[0.07]",
    avoid:              "border-red-500/25",
  }[recommendation];

  return (
    <div className={cn("rounded-2xl border bg-white/[0.03] transition-colors duration-150", borderColor, expanded && "md:col-span-2")}>
      <button onClick={onToggle} className="w-full px-4 pt-4 pb-3.5 text-left">
        <div className="flex items-center gap-3">
          <UnitTooltip unit={unit}>
            <div className="relative flex-shrink-0 h-10 w-10 overflow-hidden border border-white/[0.12] cursor-help">
              <Image src={getUnitIcon(unit.id)} alt={unit.name} fill className="object-cover" unoptimized />
            </div>
          </UnitTooltip>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <UnitTooltip unit={unit}>
                <span className="font-semibold text-sm text-white cursor-help">{unit.name}</span>
              </UnitTooltip>
              <span className={cn("font-mono text-[10px] tracking-[0.1em] uppercase", getRecommendationColor(recommendation))}>
                {getRecommendationLabel(recommendation)}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1.5 font-mono text-[10px] text-white/28 tabular-nums">
              <span>T{unit.tier}</span>
              <span>·</span>
              <span>{ATTACK_TYPE_LABELS[unit.attackType]}</span>
              <span>·</span>
              <span>{ARMOR_TYPE_LABELS[unit.armorType]}</span>
              <span>·</span>
              <span>{unit.goldCost}g</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold border font-mono tabular-nums", getScoreBadgeColor(overallScore))}>
              {pct}%
            </span>
            <span className={cn("text-white/20 text-[10px] transition-transform duration-200", expanded && "rotate-180")}>▼</span>
          </div>
        </div>

        {/* Stat bars */}
        <div className="mt-3 space-y-1.5">
          {[
            { label: "OFF", val: offensiveScore, color: "bg-emerald-500", textColor: "text-emerald-500/80" },
            { label: "DEF", val: defensiveScore, color: "bg-blue-400",    textColor: "text-blue-400/80"    },
          ].map(({ label, val, color, textColor }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-7 font-mono text-[10px] uppercase tracking-[0.12em] ${textColor}`}>{label}</span>
              <div className="flex-1 h-[2px] bg-white/[0.06]">
                <div className={cn("h-full", color)} style={{ width: `${Math.min(val * 70, 100)}%` }} />
              </div>
              <span className="w-7 text-right font-mono text-[10px] text-white/30 tabular-nums">{Math.round(val * 100)}%</span>
            </div>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-5 pt-4 text-xs">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4 min-w-0">
              <p className="text-white/55 leading-relaxed">{explanation}</p>
              <UnitDetailContent unit={unit} showLore />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">
                Effectiveness vs Enemy
              </p>
              <div className="flex flex-col max-h-[28rem] overflow-y-auto">
                {[...effectivenessVsEnemyUnits]
                  .sort((a, b) => b.multiplier - a.multiplier)
                  .map(({ enemyUnit, multiplier }) => (
                    <div key={enemyUnit.id} className="flex items-center justify-between border-b border-white/[0.04] px-2 py-1.5 gap-2 last:border-b-0">
                      <span className="text-white/40 truncate font-mono text-[10px] min-w-0">{enemyUnit.name}</span>
                      <span className={cn(
                        "font-mono font-semibold flex-shrink-0 text-[10px] tabular-nums",
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
