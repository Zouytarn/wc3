"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { getUnitIcon } from "@/data/icons";
import { cn } from "@/lib/utils";
import { DAMAGE_MATRIX } from "@/data/damage-matrix";
import type { UnitMatchupScore } from "@/lib/matchup-engine";
import type { Unit } from "@/data/units";

const ROW_H = 56;
const SVG_W = 240;

function multiplierColor(m: number): string {
  if (m >= 1.5) return "text-emerald-400";
  if (m >= 1.0) return "text-amber-400";
  return "text-red-400";
}

function multiplierBg(m: number): string {
  if (m >= 1.5) return "bg-emerald-500/15";
  if (m >= 1.0) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function lineColor(m: number): string {
  if (m >= 1.5) return "#34d399";
  if (m >= 1.0) return "#fbbf24";
  return "#f87171";
}

function lineOpacity(m: number): number {
  if (m >= 1.5) return 0.80;
  if (m >= 1.0) return 0.65;
  if (m >= 0.75) return 0.55;
  return 0.60;
}

interface Props {
  enemyUnits: Unit[];
  myUnitScores: UnitMatchupScore[];
  isCustomMode: boolean;
  onClose: () => void;
}

export function MatchupMatrixModal({ enemyUnits, myUnitScores, isCustomMode, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const myUnits = myUnitScores.filter(
    (s) => s.recommendation === "highly_recommended" || s.recommendation === "recommended"
  );

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusSide, setFocusSide] = useState<"my" | "enemy" | null>(null);
  const isFocused = focusedId !== null;

  const activeMyIds = useMemo<Set<string>>(() => {
    if (!isFocused) return new Set(myUnits.map((s) => s.unit.id));
    if (focusSide === "my") return new Set([focusedId]);
    return new Set(myUnits.map((s) => s.unit.id));
  }, [focusedId, focusSide, myUnits]);

  const activeEnemyIds = useMemo<Set<string>>(() => {
    if (!isFocused) return new Set(enemyUnits.map((u) => u.id));
    if (focusSide === "enemy") return new Set([focusedId]);
    const myScore = myUnits.find((s) => s.unit.id === focusedId);
    if (!myScore) return new Set();
    return new Set(
      myScore.effectivenessVsEnemyUnits
        .filter((e) => enemyUnits.some((eu) => eu.id === e.enemyUnit.id))
        .map((e) => e.enemyUnit.id)
    );
  }, [focusedId, focusSide, myUnits, enemyUnits]);

  function isLineActive(myUnitId: string, enemyUnitId: string) {
    if (!isFocused) return true;
    return focusSide === "my" ? myUnitId === focusedId : enemyUnitId === focusedId;
  }

  function handleMyClick(id: string) {
    if (focusedId === id && focusSide === "my") { setFocusedId(null); setFocusSide(null); }
    else { setFocusedId(id); setFocusSide("my"); }
  }

  function handleEnemyClick(id: string) {
    if (focusedId === id && focusSide === "enemy") { setFocusedId(null); setFocusSide(null); }
    else { setFocusedId(id); setFocusSide("enemy"); }
  }

  // Returns effective multiplier for a cell given current focus state
  function getMultiplier(myScore: UnitMatchupScore, enemy: Unit): number {
    if (focusSide === "enemy" && focusedId === enemy.id) {
      return DAMAGE_MATRIX[enemy.attackType][myScore.unit.armorType];
    }
    return myScore.effectivenessVsEnemyUnits.find((e) => e.enemyUnit.id === enemy.id)?.multiplier ?? 1.0;
  }

  const svgHeight = Math.max(enemyUnits.length, myUnits.length) * ROW_H;
  const hasData = enemyUnits.length > 0 && myUnits.length > 0;

  const subtitle = focusSide === "enemy" && focusedId
    ? `${enemyUnits.find(u => u.id === focusedId)?.name ?? "Enemy"}'s attack vs your units' armor`
    : focusSide === "my" && focusedId
    ? `Your unit's attack vs enemy armor`
    : isCustomMode
    ? "Your units vs selected enemy composition"
    : "All enemy units shown — select specific units above for a focused view";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d0d11] border border-white/[0.09] rounded-2xl p-4 md:p-6 w-full md:w-fit max-w-[96vw] md:max-w-[92vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Matchup Breakdown</h2>
            <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>
            <p className="text-[11px] text-white/25 mt-1">
              % vs enemy = overall score (offense 65% + defense 35%) · Tap a unit to focus
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors text-base leading-none ml-4 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-emerald-400 inline-block rounded opacity-80" />
            Strong (≥150%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-amber-400 inline-block rounded opacity-80" />
            Normal (100–149%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-red-400 inline-block rounded opacity-80" />
            Weak (&lt;100%)
          </span>
        </div>

        {!hasData && (
          <p className="text-sm text-white/40 text-center py-8">
            No data to display. Select enemy units above first.
          </p>
        )}

        {hasData && (
          <>
            {/* ── MOBILE: compact grid table ── */}
            <div className="block md:hidden">
              <div className="overflow-x-auto">
                <table className="border-separate border-spacing-1">
                  <thead>
                    <tr>
                      {/* Empty corner */}
                      <th className="w-24" />
                      {enemyUnits.map((u) => (
                        <th
                          key={u.id}
                          className={cn(
                            "cursor-pointer transition-opacity",
                            isFocused && !activeEnemyIds.has(u.id) ? "opacity-20" : "opacity-100"
                          )}
                          onClick={() => handleEnemyClick(u.id)}
                        >
                          <div className="flex flex-col items-center gap-0.5 px-1">
                            <div className="relative h-7 w-7 overflow-hidden border border-white/[0.1]">
                              <Image src={getUnitIcon(u.id)} alt={u.name} fill className="object-cover" unoptimized />
                            </div>
                            <span className="text-[9px] text-white/40 leading-tight text-center max-w-[40px] break-words">
                              {u.name.split(" ")[0]}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myUnits.map((s) => (
                      <tr
                        key={s.unit.id}
                        className={cn(
                          "cursor-pointer transition-opacity",
                          isFocused && !activeMyIds.has(s.unit.id) ? "opacity-20" : "opacity-100"
                        )}
                        onClick={() => handleMyClick(s.unit.id)}
                      >
                        {/* My unit label */}
                        <td className="pr-2 py-1">
                          <div className="flex items-center gap-1.5">
                            <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden border border-white/[0.1]">
                              <Image src={getUnitIcon(s.unit.id)} alt={s.unit.name} fill className="object-cover" unoptimized />
                            </div>
                            <div>
                              <p className="text-[10px] text-white/60 leading-tight">{s.unit.name}</p>
                              <p className={cn("text-[9px] font-semibold", s.overallScore >= 1.3 ? "text-emerald-400" : s.overallScore >= 1.05 ? "text-amber-400" : "text-white/30")}>
                                {Math.round(s.overallScore * 100)}%
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Multiplier cells */}
                        {enemyUnits.map((enemy) => {
                          const m = getMultiplier(s, enemy);
                          return (
                            <td key={enemy.id} className="text-center py-1 px-0.5">
                              <span className={cn(
                                "inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                multiplierBg(m), multiplierColor(m)
                              )}>
                                {Math.round(m * 100)}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── DESKTOP: SVG diagram ── */}
            <div className="hidden md:flex items-start" style={{ width: "fit-content" }}>
              {/* Left column: my recommended units */}
              <div className="flex-shrink-0">
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/25 mb-2 text-right pr-3">
                  Your Units
                </p>
                {myUnits.map((s) => {
                  const active = activeMyIds.has(s.unit.id);
                  return (
                    <div
                      key={s.unit.id}
                      style={{ height: ROW_H }}
                      className={cn(
                        "flex items-center justify-end gap-2.5 pr-3 cursor-pointer transition-opacity duration-200 rounded-lg select-none",
                        active ? "opacity-100" : "opacity-20"
                      )}
                      onClick={() => handleMyClick(s.unit.id)}
                    >
                      <div className="min-w-0 text-right">
                        <p className="text-xs text-white/60 truncate">{s.unit.name}</p>
                        <p className={cn(
                          "text-[10px] font-semibold",
                          s.overallScore >= 1.3 ? "text-emerald-400" :
                          s.overallScore >= 1.05 ? "text-amber-400" : "text-white/30"
                        )}>
                          {Math.round(s.overallScore * 100)}% vs enemy
                        </p>
                      </div>
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden border border-white/[0.1]">
                        <Image src={getUnitIcon(s.unit.id)} alt={s.unit.name} fill className="object-cover" unoptimized />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SVG connection area */}
              <div className="flex-shrink-0" style={{ width: SVG_W }}>
                <div style={{ height: 28 }} />
                <svg width={SVG_W} height={svgHeight}>
                  {focusSide === "enemy" && focusedId ? (
                    (() => {
                      const focusedEnemy = enemyUnits.find((u) => u.id === focusedId);
                      if (!focusedEnemy) return null;
                      const ei = enemyUnits.findIndex((u) => u.id === focusedId);
                      return myUnits.map((myScore, mi) => {
                        const m = DAMAGE_MATRIX[focusedEnemy.attackType][myScore.unit.armorType];
                        const y1 = mi * ROW_H + ROW_H / 2;
                        const y2 = ei * ROW_H + ROW_H / 2;
                        const cp = SVG_W / 2;
                        return (
                          <path
                            key={`enemy-${focusedId}-my-${myScore.unit.id}`}
                            d={`M 0 ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${SVG_W} ${y2}`}
                            fill="none"
                            stroke={lineColor(m)}
                            strokeWidth={2.5}
                            strokeOpacity={lineOpacity(m)}
                          />
                        );
                      });
                    })()
                  ) : (
                    myUnits.flatMap((myScore, mi) =>
                      myScore.effectivenessVsEnemyUnits
                        .filter((e) => enemyUnits.some((eu) => eu.id === e.enemyUnit.id))
                        .map((e) => {
                          const ei = enemyUnits.findIndex((eu) => eu.id === e.enemyUnit.id);
                          if (ei === -1) return null;
                          const y1 = mi * ROW_H + ROW_H / 2;
                          const y2 = ei * ROW_H + ROW_H / 2;
                          const cp = SVG_W / 2;
                          const active = isLineActive(myScore.unit.id, e.enemyUnit.id);
                          return (
                            <path
                              key={`${myScore.unit.id}-${e.enemyUnit.id}`}
                              d={`M 0 ${y1} C ${cp} ${y1}, ${cp} ${y2}, ${SVG_W} ${y2}`}
                              fill="none"
                              stroke={lineColor(e.multiplier)}
                              strokeWidth={active ? 2.5 : 1.5}
                              strokeOpacity={active ? lineOpacity(e.multiplier) : 0.05}
                            />
                          );
                        })
                    )
                  )}
                </svg>
              </div>

              {/* Right column: enemy units */}
              <div className="flex-shrink-0">
                <p className="text-[11px] font-medium tracking-widest uppercase text-white/25 mb-2 pl-3">
                  Enemy
                </p>
                {enemyUnits.map((u) => {
                  const active = activeEnemyIds.has(u.id);
                  return (
                    <div
                      key={u.id}
                      style={{ height: ROW_H }}
                      className={cn(
                        "flex items-center gap-2.5 pl-3 cursor-pointer transition-opacity duration-200 rounded-lg select-none",
                        active ? "opacity-100" : "opacity-20"
                      )}
                      onClick={() => handleEnemyClick(u.id)}
                    >
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden border border-white/[0.1]">
                        <Image src={getUnitIcon(u.id)} alt={u.name} fill className="object-cover" unoptimized />
                      </div>
                      <span className="text-xs text-white/60 truncate">{u.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
