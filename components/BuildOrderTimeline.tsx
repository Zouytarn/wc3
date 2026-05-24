"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BuildOrder } from "@/data/build-orders";
import {
  STEP_TYPE_CONFIG,
  STYLE_CONFIG,
  DIFFICULTY_CONFIG,
} from "@/data/build-orders";
import { getBuildStepIcon } from "@/data/icons";

interface BuildOrderTimelineProps {
  buildOrders: BuildOrder[];
}

export default function BuildOrderTimeline({ buildOrders }: BuildOrderTimelineProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showOptional, setShowOptional] = useState(false);
  const [showTips, setShowTips] = useState(false);

  if (!buildOrders.length) return null;

  const active = buildOrders[Math.min(activeIdx, buildOrders.length - 1)];
  const visibleSteps = active.steps.filter(
    (s) => s.priority !== "optional" || showOptional
  );
  const hasOptional = active.steps.some((s) => s.priority === "optional");

  return (
    <div className="space-y-4">

      {/* ── Build selector tabs ──────────────────────────────────── */}
      {buildOrders.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {buildOrders.map((bo, i) => (
            <button
              key={bo.id}
              onClick={() => { setActiveIdx(i); setShowTips(false); }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                i === activeIdx
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              )}
            >
              {bo.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Overview card ────────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">

        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{active.name}</h3>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-medium",
              STYLE_CONFIG[active.style].badgeClass
            )}>
              {STYLE_CONFIG[active.style].label}
            </span>
          </div>
          <span className={cn(
            "flex-shrink-0 text-[10px] px-2 py-1 rounded-full border font-medium whitespace-nowrap",
            DIFFICULTY_CONFIG[active.difficulty].badgeClass
          )}>
            {DIFFICULTY_CONFIG[active.difficulty].label}
          </span>
        </div>

        {/* Strategy text */}
        <p className="text-xs text-white/50 leading-relaxed">{active.strategy}</p>

        {/* Hero order */}
        {active.heroOrder.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Heroes</span>
            {active.heroOrder.map((hId, i) => (
              <span key={hId} className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/25">{i + 1}.</span>
                <span className="text-xs font-medium text-yellow-300/80">
                  {hId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            {active.keyStrengths.map((s) => (
              <div key={s} className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5 text-[10px]">▲</span>
                <span className="text-[11px] text-white/50">{s}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {active.keyWeaknesses.map((w) => (
              <div key={w} className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5 text-[10px]">▼</span>
                <span className="text-[11px] text-white/50">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="relative">
        {/* Legend strip */}
        <div className="flex gap-3 flex-wrap mb-4 px-1">
          {(["worker", "building", "tech", "unit", "hero", "research", "expand", "army"] as const).map((t) => {
            const cfg = STEP_TYPE_CONFIG[t];
            const hasType = active.steps.some((s) => s.type === t);
            if (!hasType) return null;
            return (
              <div key={t} className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dotColor)} />
                <span className={cn("text-[10px]", cfg.textColor)}>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div>
          {visibleSteps.map((step, idx) => {
            const cfg = STEP_TYPE_CONFIG[step.type];
            const isLast = idx === visibleSteps.length - 1;

            return (
              <div key={idx} className="flex gap-0 items-stretch">

                {/* Supply column */}
                <div className="w-14 flex-shrink-0 flex flex-col items-end pt-2 pr-3">
                  <span className="text-[10px] text-white/30 font-mono tabular-nums leading-none">
                    {step.supply}
                  </span>
                  <span className="text-[8px] text-white/15 leading-none">food</span>
                </div>

                {/* Dot + connector */}
                <div className="flex flex-col items-center w-5 flex-shrink-0">
                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ring-2 ring-black/40",
                    cfg.dotColor,
                    step.priority === "critical" ? "opacity-100" : "opacity-60"
                  )} />
                  {!isLast && (
                    <div className="w-px flex-1 bg-white/[0.08] mt-0.5" style={{ minHeight: 12 }} />
                  )}
                </div>

                {/* Content card */}
                <div className={cn(
                  "flex-1 ml-3 mb-2.5 rounded-xl px-3 py-2 border",
                  cfg.bgColor,
                  cfg.borderColor,
                  step.priority !== "critical" && "opacity-70"
                )}>
                  {step.iconSteps ? (
                    /* Compound step: icons as decorators + full action text */
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Icon cluster */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {step.iconSteps.map(({ key, label }) => {
                            const src = getBuildStepIcon(key);
                            return src ? (
                              <div key={key} className={cn(
                                "w-7 h-7 rounded-md overflow-hidden border flex-shrink-0",
                                cfg.borderColor
                              )}>
                                <Image src={src} alt={label} width={28} height={28} unoptimized className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span key={key} className="text-sm leading-none w-7 text-center">{cfg.emoji}</span>
                            );
                          })}
                        </div>
                        {/* Action text — the human-readable description */}
                        <span className={cn("text-[11px] font-medium flex-1 min-w-0", cfg.textColor)}>
                          {step.action}
                        </span>
                      </div>
                      {step.note && (
                        <p className="text-[10px] text-white/35 leading-relaxed mt-0.5">{step.note}</p>
                      )}
                    </div>
                  ) : (
                    /* Single step: one icon + full action text */
                    <div className="flex items-center gap-2">
                      {step.iconKey && getBuildStepIcon(step.iconKey) ? (
                        <div className={cn(
                          "w-7 h-7 flex-shrink-0 rounded-md overflow-hidden border",
                          cfg.borderColor
                        )}>
                          <Image
                            src={getBuildStepIcon(step.iconKey)!}
                            alt=""
                            width={28}
                            height={28}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-base leading-none flex-shrink-0 w-7 text-center">{cfg.emoji}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[11px] font-medium leading-snug", cfg.textColor)}>
                          {step.action}
                        </p>
                        {step.note && (
                          <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional steps toggle */}
        {hasOptional && (
          <button
            onClick={() => setShowOptional((v) => !v)}
            className="ml-17 pl-8 mt-1 text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <span>{showOptional ? "▲ Hide" : "▼ Show"} optional steps</span>
          </button>
        )}
      </div>

      {/* ── Late game + Tips ─────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] pt-3 space-y-2">
        <button
          onClick={() => setShowTips((v) => !v)}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors w-full"
        >
          <span className="text-[10px]">{showTips ? "▲" : "▼"}</span>
          <span>Late game plan &amp; tips</span>
        </button>

        {showTips && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Late game */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Late Game</p>
              <p className="text-[11px] text-white/60 leading-relaxed">{active.lateGame}</p>
            </div>

            {/* Tips */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Key Tips</p>
              <ul className="space-y-1.5">
                {active.generalTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-amber-400/60 text-[10px] mt-0.5 flex-shrink-0">•</span>
                    <span className="text-[11px] text-white/55 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
