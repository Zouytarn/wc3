"use client";

import { useState } from "react";
import {
  DAMAGE_MATRIX,
  ATTACK_TYPE_LABELS,
  ARMOR_TYPE_LABELS,
  ATTACK_TYPE_DESCRIPTIONS,
  ARMOR_TYPE_DESCRIPTIONS,
  getEffectivenessColor,
  getEffectivenessLabel,
  type AttackType,
  type ArmorType,
} from "@/data/damage-matrix";

const ATTACK_TYPES: AttackType[] = ["piercing", "normal", "siege", "magic", "chaos", "hero", "spells"];
const ARMOR_TYPES: ArmorType[] = ["unarmored", "light", "medium", "heavy", "fortified", "hero"];

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
      <p className="mb-2 text-[10px] text-slate-600 sm:hidden">← Scroll sideways to see full table</p>
      <div className="overflow-x-auto rounded-lg border border-amber-900/30">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {/* Corner cell */}
              <th className="bg-black/60 p-1.5 sm:p-3 text-left text-[10px] sm:text-xs text-amber-700 font-normal border-b border-r border-amber-900/30 whitespace-nowrap">
                Atk ↓ / Armor →
              </th>
              {ARMOR_TYPES.map((armor) => (
                <th
                  key={armor}
                  onMouseEnter={() => setHoveredArmor(armor)}
                  onMouseLeave={() => setHoveredArmor(null)}
                  className={`
                    bg-black/60 p-1.5 sm:p-3 text-[10px] sm:text-xs font-bold text-center border-b border-amber-900/30 cursor-default transition-colors whitespace-nowrap
                    ${hoveredArmor === armor ? "text-amber-300 bg-amber-950/40" : "text-amber-600"}
                  `}
                  title={ARMOR_TYPE_DESCRIPTIONS[armor]}
                >
                  {ARMOR_TYPE_LABELS[armor]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTACK_TYPES.map((attack, rowIdx) => (
              <tr key={attack} className={rowIdx % 2 === 0 ? "bg-black/20" : "bg-black/10"}>
                <td
                  onMouseEnter={() => setHoveredAttack(attack)}
                  onMouseLeave={() => setHoveredAttack(null)}
                  className={`
                    p-1.5 sm:p-3 text-[10px] sm:text-xs font-bold border-r border-amber-900/30 cursor-default transition-colors whitespace-nowrap
                    ${hoveredAttack === attack ? "text-amber-300 bg-amber-950/40" : "text-amber-600"}
                  `}
                  title={ATTACK_TYPE_DESCRIPTIONS[attack]}
                >
                  {ATTACK_TYPE_LABELS[attack]}
                </td>
                {ARMOR_TYPES.map((armor) => {
                  const multiplier = DAMAGE_MATRIX[attack][armor];
                  const pct = Math.round(multiplier * 100);
                  const isHighlightedRow = hoveredAttack === attack;
                  const isHighlightedCol = hoveredArmor === armor;
                  const isActive = isHighlightedRow || isHighlightedCol;

                  return (
                    <td
                      key={armor}
                      onMouseEnter={(e) => {
                        setTooltip({
                          attackType: attack,
                          armorType: armor,
                          multiplier,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onMouseMove={(e) => {
                        setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`
                        p-1.5 sm:p-3 text-center text-[10px] sm:text-xs font-bold cursor-default transition-all duration-100
                        ${getEffectivenessColor(multiplier)}
                        ${isActive ? "ring-1 ring-inset ring-white/30" : ""}
                      `}
                    >
                      {pct}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-amber-700 bg-[#0d0d1a] p-3 shadow-xl text-xs max-w-[220px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <div className="font-bold text-amber-400 mb-1">
            {ATTACK_TYPE_LABELS[tooltip.attackType]} vs {ARMOR_TYPE_LABELS[tooltip.armorType]}
          </div>
          <div className={`text-base font-bold mb-1 ${getEffectivenessColor(tooltip.multiplier).replace("bg-", "text-").split(" ")[0]}`}>
            {Math.round(tooltip.multiplier * 100)}% — {getEffectivenessLabel(tooltip.multiplier)}
          </div>
          <div className="text-slate-400 text-[10px]">
            <div className="mb-1"><span className="text-slate-300">Attack:</span> {ATTACK_TYPE_DESCRIPTIONS[tooltip.attackType]}</div>
            <div><span className="text-slate-300">Armor:</span> {ARMOR_TYPE_DESCRIPTIONS[tooltip.armorType]}</div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {[
          { label: "≥150% Devastating", cls: "bg-green-600" },
          { label: "125% Strong", cls: "bg-green-500/80" },
          { label: "100% Normal", cls: "bg-yellow-600/80" },
          { label: "75% Weak", cls: "bg-orange-600/80" },
          { label: "≤50% Ineffective", cls: "bg-red-700" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`h-3 w-8 rounded ${item.cls}`} />
            <span className="text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
