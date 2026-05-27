"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Unit } from "@/data/units";
import { UnitTooltipStats } from "@/components/UnitDetailContent";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { cn } from "@/lib/utils";

const TOOLTIP_W = 480;

interface UnitTooltipProps {
  unit: Unit;
  children: React.ReactNode;
  className?: string;
}

export function UnitTooltip({ unit, children, className }: UnitTooltipProps) {
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

    // Center on anchor, clamp to viewport
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));

    // Prefer below, fall back to above
    const estHeight = 200;
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
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <p className="font-semibold text-sm text-white leading-tight">{unit.name}</p>
        <p className="font-mono text-[10px] text-white/30 mt-0.5">
          {unit.builtFrom ? `Built from ${unit.builtFrom}` : "Unit"}
          {unit.level ? ` · Level ${unit.level}` : ""}
          {" · "}
          <span className="text-white/40">{ATTACK_TYPE_LABELS[unit.attackType]}</span>
          {" / "}
          <span className="text-white/40">{ARMOR_TYPE_LABELS[unit.armorType]}</span>
        </p>
      </div>

      {/* 2-col stat grid */}
      <UnitTooltipStats unit={unit} />
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
