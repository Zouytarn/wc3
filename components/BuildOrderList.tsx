"use client";

import { useState } from "react";
import type { BuildOrder } from "@/data/build-orders";
import { DIFFICULTY_LABELS } from "@/data/build-orders";
import { cn } from "@/lib/utils";

const PRIORITY_ACCENT = {
  critical: "border-l-red-500/60",
  normal:   "border-l-amber-500/40",
  optional: "border-l-white/10",
};

interface BuildOrderListProps {
  buildOrder: BuildOrder;
}

export function BuildOrderList({ buildOrder }: BuildOrderListProps) {
  const [showOptional, setShowOptional] = useState(false);
  const steps = buildOrder.steps.filter((s) => showOptional || s.priority !== "optional");

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-white text-base leading-tight">{buildOrder.name}</p>
            <p className="mt-1 text-sm text-white/50 leading-relaxed">{buildOrder.strategy}</p>
          </div>
          <span className="flex-shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
            {DIFFICULTY_LABELS[buildOrder.difficulty]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="label-section mb-2">Strengths</p>
            <ul className="space-y-1">
              {buildOrder.keyStrengths.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-emerald-400/70">
                  <span className="flex-shrink-0 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-section mb-2">Weaknesses</p>
            <ul className="space-y-1">
              {buildOrder.keyWeaknesses.map((w) => (
                <li key={w} className="flex items-start gap-1.5 text-xs text-red-400/70">
                  <span className="flex-shrink-0 mt-0.5">!</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="label-section">
            Build Steps
            <span className="ml-2 normal-case text-white/20 font-normal">({steps.length})</span>
          </p>
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            {showOptional ? "Hide optional" : "Show optional"}
          </button>
        </div>

        <div className="space-y-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-r-xl border-l-2 pl-3 pr-3 py-2.5 bg-white/[0.025] transition-colors",
                PRIORITY_ACCENT[step.priority]
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 font-mono text-xs text-white/30 w-10 pt-px">{step.time}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white/80">{step.action}</span>
                  {step.note && (
                    <p className="mt-0.5 text-[11px] text-white/35 italic">{step.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Late game + tips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="surface rounded-2xl p-4">
          <p className="label-section mb-2">Late Game</p>
          <p className="text-xs text-white/50 leading-relaxed">{buildOrder.lateGame}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="label-section mb-2">General Tips</p>
          <ul className="space-y-1.5">
            {buildOrder.generalTips.map((tip) => (
              <li key={tip} className="flex items-start gap-1.5 text-xs text-white/50">
                <span className="text-amber-500/50 mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
