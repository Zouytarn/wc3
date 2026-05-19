"use client";

import { type Race, RACE_LABELS, RACE_DESCRIPTIONS } from "@/data/units";
import { cn } from "@/lib/utils";

const RACE_ICONS: Record<Race, string> = {
  human:    "🛡️",
  orc:      "⚔️",
  nightelf: "🌙",
  undead:   "💀",
};

const RACE_THEME: Record<Race, { border: string; glow: string; badge: string; bg: string }> = {
  human:    { border: "border-blue-700",   glow: "hover:shadow-blue-900/60",   badge: "bg-blue-900/60 text-blue-300",   bg: "from-blue-950/60 to-slate-950/80" },
  orc:      { border: "border-red-700",    glow: "hover:shadow-red-900/60",    badge: "bg-red-900/60 text-red-300",     bg: "from-red-950/60 to-slate-950/80" },
  nightelf: { border: "border-purple-700", glow: "hover:shadow-purple-900/60", badge: "bg-purple-900/60 text-purple-300", bg: "from-purple-950/60 to-slate-950/80" },
  undead:   { border: "border-slate-600",  glow: "hover:shadow-slate-700/60",  badge: "bg-slate-800/60 text-slate-300",  bg: "from-slate-900/60 to-slate-950/80" },
};

interface RaceCardProps {
  race: Race;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
  onClick: (race: Race) => void;
}

export function RaceCard({ race, selected, disabled, label, onClick }: RaceCardProps) {
  const theme = RACE_THEME[race];

  return (
    <button
      onClick={() => !disabled && onClick(race)}
      disabled={disabled}
      className={cn(
        "relative w-full rounded-lg border-2 bg-gradient-to-b p-5 text-left transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        theme.bg,
        theme.border,
        theme.glow,
        selected && "ring-2 ring-amber-400 ring-offset-1 ring-offset-black",
        disabled && "opacity-40 cursor-not-allowed hover:scale-100"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-black">
          {label ?? "Selected"}
        </div>
      )}
      <div className="mb-2 text-3xl">{RACE_ICONS[race]}</div>
      <div className="mb-1 text-lg font-bold text-amber-200">{RACE_LABELS[race]}</div>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{RACE_DESCRIPTIONS[race]}</p>
    </button>
  );
}
