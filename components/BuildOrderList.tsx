"use client";

import { useState } from "react";
import type { BuildOrder } from "@/data/build-orders";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/data/build-orders";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES = {
  critical: "border-l-2 border-l-red-600 bg-red-950/20",
  normal:   "border-l-2 border-l-yellow-700 bg-yellow-950/10",
  optional: "border-l-2 border-l-slate-700 bg-slate-950/20 opacity-70",
};

const PRIORITY_BADGES = {
  critical: "text-red-400 text-[10px]",
  normal:   "text-yellow-600 text-[10px]",
  optional: "text-slate-600 text-[10px]",
};

interface BuildOrderListProps {
  buildOrder: BuildOrder;
}

export function BuildOrderList({ buildOrder }: BuildOrderListProps) {
  const [showOptional, setShowOptional] = useState(false);

  const filteredSteps = buildOrder.steps.filter(
    (s) => showOptional || s.priority !== "optional"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-amber-900/30 bg-black/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-amber-300 text-lg">{buildOrder.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{buildOrder.strategy}</p>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-xs flex-shrink-0", DIFFICULTY_COLORS[buildOrder.difficulty])}>
            {DIFFICULTY_LABELS[buildOrder.difficulty]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-bold text-green-600">Key Strengths</div>
            <ul className="space-y-1">
              {buildOrder.keyStrengths.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-green-400/80">
                  <span className="text-green-700 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold text-red-600">Weaknesses</div>
            <ul className="space-y-1">
              {buildOrder.keyWeaknesses.map((w) => (
                <li key={w} className="flex items-start gap-1.5 text-xs text-red-400/80">
                  <span className="text-red-700 mt-0.5">!</span>
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
          <h4 className="font-bold text-amber-400 text-sm">
            Build Order Steps
            <span className="ml-2 text-slate-600 font-normal text-xs">({filteredSteps.length} steps)</span>
          </h4>
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showOptional ? "Hide optional" : "Show optional"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-3 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-1 bg-red-600 rounded" />
            Critical
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-1 bg-yellow-700 rounded" />
            Normal
          </div>
          {showOptional && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-1 bg-slate-700 rounded" />
              Optional
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {filteredSteps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-r-lg px-3 py-2.5 transition-colors",
                PRIORITY_STYLES[step.priority]
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 font-mono text-amber-700 text-xs w-10">{step.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-sm text-slate-200">{step.action}</span>
                    <span className={PRIORITY_BADGES[step.priority]}>
                      {step.priority.toUpperCase()}
                    </span>
                  </div>
                  {step.note && (
                    <p className="mt-0.5 text-xs text-slate-500 italic">{step.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Late game & tips */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-900/30 bg-black/30 p-4">
          <h4 className="font-bold text-amber-500 mb-2 text-sm">Late Game Transition</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{buildOrder.lateGame}</p>
        </div>
        <div className="rounded-lg border border-amber-900/30 bg-black/30 p-4">
          <h4 className="font-bold text-amber-500 mb-2 text-sm">General Tips</h4>
          <ul className="space-y-1.5">
            {buildOrder.generalTips.map((tip) => (
              <li key={tip} className="flex items-start gap-1.5 text-xs text-slate-400">
                <span className="text-amber-700 mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
