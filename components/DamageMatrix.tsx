"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DAMAGE_MATRIX,
  ATTACK_TYPE_LABELS,
  ARMOR_TYPE_LABELS,
  ATTACK_TYPE_DESCRIPTIONS,
  ARMOR_TYPE_DESCRIPTIONS,
  type AttackType,
  type ArmorType,
} from "@/data/damage-matrix";

const ATTACK_TYPES: AttackType[] = ["piercing", "normal", "siege", "magic", "chaos", "hero", "spells"];
const ARMOR_TYPES: ArmorType[] = ["unarmored", "light", "medium", "heavy", "fortified", "hero"];

function cellColor(m: number): string {
  if (m >= 2.0)  return "bg-emerald-500/90 text-white";
  if (m >= 1.5)  return "bg-emerald-500/60 text-white";
  if (m >= 1.25) return "bg-emerald-500/30 text-emerald-300";
  if (m >= 1.0)  return "bg-white/[0.06] text-white/60";
  if (m >= 0.75) return "bg-orange-500/20 text-orange-300";
  return "bg-red-500/25 text-red-300";
}

interface TooltipInfo {
  attackType: AttackType;
  armorType: ArmorType;
  multiplier: number;
  x: number;
  y: number;
}

export function DamageMatrix() {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [hoveredAttack, setHoveredAttack] = useState<AttackType | null>(null);
  const [hoveredArmor, setHoveredArmor] = useState<ArmorType | null>(null);

  return (
    <div className="relative">
      <p className="mb-2 text-[11px] text-white/25 sm:hidden">← Scroll to see full table</p>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-white/[0.04] px-3 py-2.5 text-left text-[11px] text-white/30 font-medium border-b border-r border-white/[0.06] whitespace-nowrap">
                Atk ↓ / Armor →
              </th>
              {ARMOR_TYPES.map((armor) => (
                <th
                  key={armor}
                  onMouseEnter={() => setHoveredArmor(armor)}
                  onMouseLeave={() => setHoveredArmor(null)}
                  title={ARMOR_TYPE_DESCRIPTIONS[armor]}
                  className={cn(
                    "px-2 sm:px-3 py-2.5 text-[11px] font-medium text-center border-b border-white/[0.06] cursor-default whitespace-nowrap",
                    hoveredArmor === armor ? "bg-amber-500/10 text-amber-400" : "bg-white/[0.04] text-white/40"
                  )}
                >
                  {ARMOR_TYPE_LABELS[armor]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTACK_TYPES.map((attack, rowIdx) => (
              <tr key={attack} className={rowIdx % 2 === 0 ? "bg-white/[0.01]" : ""}>
                <td
                  onMouseEnter={() => setHoveredAttack(attack)}
                  onMouseLeave={() => setHoveredAttack(null)}
                  title={ATTACK_TYPE_DESCRIPTIONS[attack]}
                  className={cn(
                    "px-3 py-2 text-[11px] font-medium border-r border-white/[0.06] cursor-default whitespace-nowrap",
                    hoveredAttack === attack ? "bg-amber-500/10 text-amber-400" : "text-white/40"
                  )}
                >
                  {ATTACK_TYPE_LABELS[attack]}
                </td>
                {ARMOR_TYPES.map((armor) => {
                  const m = DAMAGE_MATRIX[attack][armor];
                  const active = hoveredAttack === attack || hoveredArmor === armor;
                  return (
                    <td
                      key={armor}
                      onMouseEnter={(e) => setTooltip({ attackType: attack, armorType: armor, multiplier: m, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e) => setTooltip((p) => p ? { ...p, x: e.clientX, y: e.clientY } : null)}
                      onMouseLeave={() => setTooltip(null)}
                      className={cn(
                        "px-2 sm:px-3 py-2 text-center text-[11px] font-semibold cursor-default",
                        cellColor(m),
                        active ? "opacity-100" : "opacity-75"
                      )}
                    >
                      {Math.round(m * 100)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-white/10 bg-[#0d0d15] p-3 shadow-2xl text-xs max-w-[220px]"
          style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
        >
          <p className="font-semibold text-white/80 mb-1">
            {ATTACK_TYPE_LABELS[tooltip.attackType]} vs {ARMOR_TYPE_LABELS[tooltip.armorType]}
          </p>
          <p className="text-base font-bold text-amber-400 mb-1">{Math.round(tooltip.multiplier * 100)}%</p>
          <p className="text-white/35 text-[10px] leading-relaxed">
            {ATTACK_TYPE_DESCRIPTIONS[tooltip.attackType]}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/35">
        {[
          { label: "200% Devastating", cls: "bg-emerald-500/90" },
          { label: "≥150% Strong", cls: "bg-emerald-500/60" },
          { label: "100% Normal", cls: "bg-white/[0.06]" },
          { label: "75% Weak", cls: "bg-orange-500/20" },
          { label: "≤50% Ineffective", cls: "bg-red-500/25" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-5 rounded ${item.cls}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
