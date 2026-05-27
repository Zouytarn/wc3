"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RaceCard } from "@/components/RaceCard";
import { type Race, RACE_LABELS } from "@/data/units";

const RACES: Race[] = ["human", "orc", "nightelf", "undead"];

const FEATURES = [
  {
    label: "Damage Matrix",
    detail: "Every matchup scored using the full WC3 attack vs armor multiplier table.",
  },
  {
    label: "Counter-Picks",
    detail: "Units ranked against your opponent's exact army composition.",
  },
  {
    label: "Build Orders",
    detail: "Step-by-step timings for all 16 race matchup combinations.",
  },
];

function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-white/[0.07] ${className}`} />;
}

function StepLabel({
  number,
  label,
  dim,
}: {
  number: string;
  label: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-[10px] tracking-[0.25em] text-white/20 tabular-nums flex-shrink-0">
        {number}
      </span>
      <Hairline className="flex-1" />
      <span
        className={`font-mono text-[10px] tracking-[0.2em] uppercase flex-shrink-0 transition-colors duration-300 ${
          dim ? "text-white/18" : "text-white/45"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [myRace, setMyRace] = useState<Race | null>(null);
  const [enemyRace, setEnemyRace] = useState<Race | null>(null);

  function handleAnalyze() {
    if (myRace && enemyRace) router.push(`/matchup/${myRace}-vs-${enemyRace}`);
  }

  const ready = myRace && enemyRace;

  return (
    <div className="min-h-screen">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl px-6 sm:px-10 pt-20 sm:pt-32 pb-14">

          {/* Overline */}
          <div className="anim-1 flex items-center gap-4 mb-10">
            <Hairline className="flex-1" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/25 flex-shrink-0">
              Warcraft III · Reforged
            </span>
            <Hairline className="flex-1" />
          </div>

          {/* Display title */}
          <div className="anim-2 text-center mb-10">
            <h1
              style={{ fontFamily: "var(--font-cinzel)" }}
              className="text-[clamp(3.5rem,11vw,7.5rem)] font-black leading-[0.9] tracking-tight text-white"
            >
              Strategy
              <br />
              <span className="text-white/40">Advisor</span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="anim-3 text-center text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
            Counter-picks, hero recommendations, and build orders — driven by the
            WC3 damage&nbsp;&amp;&nbsp;armor matrix.
          </p>
        </div>

        {/* ── Selection ───────────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl px-6 sm:px-10 pb-20 space-y-10">

          {/* Step 1 */}
          <section className="anim-4">
            <StepLabel
              number="01"
              label={myRace ? `${RACE_LABELS[myRace]} — Selected` : "Your Race"}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RACES.map((race) => (
                <RaceCard
                  key={race}
                  race={race}
                  selected={myRace === race}
                  onClick={setMyRace}
                />
              ))}
            </div>
          </section>

          {/* Step 2 */}
          <section className="anim-5">
            <StepLabel
              number="02"
              label={
                enemyRace
                  ? `${RACE_LABELS[enemyRace]} — Enemy`
                  : "Enemy Race"
              }
              dim={!myRace}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RACES.map((race) => (
                <RaceCard
                  key={race}
                  race={race}
                  selected={enemyRace === race}
                  disabled={!myRace}
                  onClick={setEnemyRace}
                />
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="anim-6 pt-1 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!ready}
              className={`
                min-w-[260px] px-10 py-4
                font-mono text-[11px] tracking-[0.2em] uppercase
                transition-all duration-200
                ${
                  ready
                    ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.97] cursor-pointer"
                    : "bg-white/[0.04] text-white/20 border border-white/[0.07] cursor-not-allowed"
                }
              `}
            >
              {ready
                ? `Analyze ${RACE_LABELS[myRace!]} vs ${RACE_LABELS[enemyRace!]}`
                : "Select both races"}
            </button>
          </div>
        </div>

        {/* ── Feature strip ───────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <Hairline />
          <div className="py-12 grid grid-cols-1 sm:grid-cols-3">
            {FEATURES.map(({ label, detail }, i) => (
              <div
                key={label}
                className={`py-6 sm:py-0 sm:px-8 ${
                  i === 0 ? "sm:pl-0" : ""
                } ${i === FEATURES.length - 1 ? "sm:pr-0" : ""} ${
                  i > 0 ? "border-t sm:border-t-0 sm:border-l border-white/[0.07]" : ""
                }`}
              >
                <p
                  className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500/60 mb-2.5"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {label}
                </p>
                <p className="text-xs text-white/35 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
          <Hairline />
        </div>
    </div>
  );
}
