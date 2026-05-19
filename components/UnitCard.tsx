"use client";

import { useState } from "react";
import type { UnitMatchupScore } from "@/lib/matchup-engine";
import { getRecommendationLabel, getRecommendationColor, getScoreBadgeColor } from "@/lib/matchup-engine";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { cn } from "@/lib/utils";

interface UnitCardProps {
  score: UnitMatchupScore;
  rank?: number;
}

export function UnitCard({ score, rank }: UnitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { unit, offensiveScore, defensiveScore, overallScore, effectivenessVsEnemyUnits, explanation, recommendation } = score;

  const pct = Math.round(overallScore * 100);

  return (
    <div
      className={cn(
        "rounded-lg border bg-black/40 transition-all duration-200",
        recommendation === "highly_recommended" && "border-green-800",
        recommendation === "recommended" && "border-yellow-800",
        recommendation === "situational" && "border-orange-800",
        recommendation === "avoid" && "border-red-900 opacity-60"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          {rank && (
            <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-900/60 text-xs font-bold text-amber-400">
              {rank}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-200">{unit.name}</span>
              <span className={cn("text-xs font-medium", getRecommendationColor(recommendation))}>
                {getRecommendationLabel(recommendation)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>T{unit.tier}</span>
              <span>•</span>
              <span>{ATTACK_TYPE_LABELS[unit.attackType]} dmg</span>
              <span>•</span>
              <span>{ARMOR_TYPE_LABELS[unit.armorType]} armor</span>
              <span>•</span>
              <span>{unit.range}</span>
              <span>•</span>
              <span>{unit.goldCost}g {unit.lumberCost > 0 ? `${unit.lumberCost}w` : ""}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", getScoreBadgeColor(overallScore))}>
              {pct}%
            </div>
            <div className="mt-1 text-xs text-slate-600">{expanded ? "▲" : "▼"}</div>
          </div>
        </div>

        {/* Score bars */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-slate-500">Offensive</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-green-600 transition-all"
                style={{ width: `${Math.min(offensiveScore * 70, 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-400">{Math.round(offensiveScore * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-slate-500">Defensive</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(defensiveScore * 70, 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-slate-400">{Math.round(defensiveScore * 100)}%</span>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-800 px-4 pb-4 pt-3 text-xs text-slate-400 space-y-3">
          <p className="text-slate-300">{explanation}</p>

          {unit.special.length > 0 && (
            <div>
              <div className="font-bold text-amber-600 mb-1">Special Abilities</div>
              <ul className="space-y-0.5">
                {unit.special.map((s) => (
                  <li key={s} className="flex items-start gap-1.5">
                    <span className="text-amber-700 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="font-bold text-amber-600 mb-1">Effectiveness vs Enemy Units</div>
            <div className="grid grid-cols-2 gap-1">
              {effectivenessVsEnemyUnits.map(({ enemyUnit, multiplier, label }) => (
                <div key={enemyUnit.id} className="flex items-center justify-between rounded bg-black/30 px-2 py-1">
                  <span className="text-slate-400">{enemyUnit.name}</span>
                  <span
                    className={cn(
                      "font-bold",
                      multiplier >= 1.5 ? "text-green-400" :
                      multiplier >= 1.0 ? "text-yellow-400" :
                      "text-red-400"
                    )}
                  >
                    {Math.round(multiplier * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-slate-500 mb-1">Stats</div>
              <div className="space-y-0.5 text-slate-500">
                <div>HP: <span className="text-slate-300">{unit.hp}</span></div>
                <div>DMG: <span className="text-slate-300">{unit.damage}</span></div>
                <div>Food: <span className="text-slate-300">{unit.foodCost}</span></div>
                <div>Speed: <span className="text-slate-300">{unit.speed}</span></div>
              </div>
            </div>
            {unit.description && (
              <div>
                <div className="font-bold text-slate-500 mb-1">Overview</div>
                <p className="text-slate-500">{unit.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
