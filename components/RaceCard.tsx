"use client";

import Image from "next/image";
import { type Race, RACE_LABELS, RACE_DESCRIPTIONS } from "@/data/units";
import { RACE_ICONS } from "@/data/icons";
import { cn } from "@/lib/utils";

const RACE_ACCENT: Record<Race, { border: string; bar: string }> = {
  human:    { border: "border-blue-500/50",   bar: "bg-blue-400/70" },
  orc:      { border: "border-red-500/50",    bar: "bg-red-400/70" },
  nightelf: { border: "border-purple-500/50", bar: "bg-purple-400/70" },
  undead:   { border: "border-slate-400/40",  bar: "bg-slate-400/70" },
};

interface RaceCardProps {
  race: Race;
  selected?: boolean;
  disabled?: boolean;
  onClick: (race: Race) => void;
}

export function RaceCard({ race, selected, disabled, onClick }: RaceCardProps) {
  const accent = RACE_ACCENT[race];
  return (
    <div className="relative group">
      <button
        onClick={() => !disabled && onClick(race)}
        disabled={disabled}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden text-center transition-colors duration-150",
          "bg-white/[0.04] border",
          selected ? accent.border : "border-white/[0.08]",
          !disabled && !selected && "hover:bg-white/[0.07] hover:border-white/[0.14]",
          !disabled && "active:scale-[0.98] cursor-pointer",
          disabled && "opacity-30 cursor-not-allowed"
        )}
      >
        {/* Race image */}
        <div className="pt-4 px-4">
          <div className="relative h-20 w-20 overflow-hidden mx-auto">
            <Image src={RACE_ICONS[race]} alt={RACE_LABELS[race]} fill className="object-cover" unoptimized />
          </div>
        </div>

        {/* Race name */}
        <div className="px-3 py-3">
          <p
            style={{ fontFamily: "var(--font-cinzel)" }}
            className={cn(
              "text-xs font-bold leading-tight transition-colors duration-150",
              selected ? "text-white" : "text-white/55"
            )}
          >
            {RACE_LABELS[race]}
          </p>
        </div>

        {/* Selection accent bar at bottom */}
        {selected && (
          <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", accent.bar)} />
        )}
      </button>

      {/* Hover description tooltip */}
      {!disabled && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-[#0e0e1a] border border-white/[0.10] px-3 py-2.5 shadow-2xl">
            <p className="text-[11px] text-white/55 leading-relaxed">{RACE_DESCRIPTIONS[race]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
