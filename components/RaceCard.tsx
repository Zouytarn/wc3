"use client";

import Image from "next/image";
import { type Race, RACE_LABELS, RACE_DESCRIPTIONS } from "@/data/units";
import { RACE_ICONS } from "@/data/icons";
import { cn } from "@/lib/utils";

const RACE_ACCENT: Record<Race, { ring: string; dot: string }> = {
  human:    { ring: "ring-blue-500/50",   dot: "bg-blue-400" },
  orc:      { ring: "ring-red-500/50",    dot: "bg-red-400" },
  nightelf: { ring: "ring-purple-500/50", dot: "bg-purple-400" },
  undead:   { ring: "ring-slate-400/40",  dot: "bg-slate-400" },
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
    <button
      onClick={() => !disabled && onClick(race)}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-2xl p-4 text-left transition-all duration-200",
        "bg-white/[0.05] border border-white/[0.09]",
        !disabled && "hover:bg-white/[0.08] active:scale-[0.98] cursor-pointer",
        selected && `ring-2 ${accent.ring}`,
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {selected && (
        <div className={cn("absolute top-3 right-3 h-2 w-2 rounded-full", accent.dot)} />
      )}
      <div className="mb-3 relative h-12 w-12 overflow-hidden rounded-xl border border-white/10">
        <Image src={RACE_ICONS[race]} alt={RACE_LABELS[race]} fill className="object-cover" unoptimized />
      </div>
      <p className="font-semibold text-sm text-white leading-tight mb-1">{RACE_LABELS[race]}</p>
      <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">{RACE_DESCRIPTIONS[race]}</p>
    </button>
  );
}
