"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Hero } from "@/data/heroes";
import { HERO_ROLE_LABELS } from "@/data/heroes";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { cn } from "@/lib/utils";

const TOOLTIP_W = 400;

interface HeroTooltipProps {
  hero: Hero;
  children: React.ReactNode;
  className?: string;
}

function HeroStats({ hero }: { hero: Hero }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "HP",      value: <span className="text-emerald-400">{hero.baseHP}</span> },
    { label: "Mana",    value: <span className="text-blue-400">{hero.baseMana}</span> },
    { label: "Damage",  value: <span className="text-red-400/90">{hero.baseDamage}</span> },
    { label: "Primary", value: <span className="capitalize">{hero.primaryStat}</span> },
    { label: "Attack",  value: ATTACK_TYPE_LABELS[hero.attackType] },
    { label: "Armor",   value: ARMOR_TYPE_LABELS[hero.armorType] },
    { label: "Range",   value: hero.range },
    { label: "Speed",   value: hero.speed },
  ];

  const mid = Math.ceil(rows.length / 2);
  const left = rows.slice(0, mid);
  const right = rows.slice(mid);

  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
        <div className="px-4 py-3 space-y-1.5">
          {left.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 space-y-1.5">
          {right.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {hero.abilities.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-2">
          <span className="font-mono text-[10px] text-white/25 tracking-[0.05em]">
            {hero.abilities.map((a) => a.name).join(" · ")}
          </span>
        </div>
      )}
    </>
  );
}

export function HeroTooltip({ hero, children, className }: HeroTooltipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const pad = 12;
    const w = Math.min(TOOLTIP_W, window.innerWidth - pad * 2);
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));
    const estHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom - pad;
    const top = spaceBelow >= estHeight
      ? rect.bottom + 6
      : Math.max(pad, rect.top - estHeight - 6);
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  function show() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 160);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  const tooltip = open && mounted && (
    <div
      className="fixed z-[9999] pointer-events-none rounded-xl border border-white/[0.14] bg-[#0b0b13] overflow-hidden"
      style={{ top: pos.top, left: pos.left, width: Math.min(TOOLTIP_W, window.innerWidth - 24) }}
      role="tooltip"
    >
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <p className="font-semibold text-sm text-white leading-tight">{hero.name}</p>
        <p className="font-mono text-[10px] text-white/30 mt-0.5">
          {HERO_ROLE_LABELS[hero.role]} · {ATTACK_TYPE_LABELS[hero.attackType]} · {hero.range}
        </p>
      </div>
      <HeroStats hero={hero} />
    </div>
  );

  return (
    <>
      <div
        ref={anchorRef}
        className={cn("relative", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {mounted && tooltip && createPortal(tooltip, document.body)}
    </>
  );
}
