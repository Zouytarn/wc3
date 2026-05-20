"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RaceCard } from "@/components/RaceCard";
import { type Race, RACE_LABELS } from "@/data/units";

const RACES: Race[] = ["human", "orc", "nightelf", "undead"];

export default function HomePage() {
  const router = useRouter();
  const [myRace, setMyRace] = useState<Race | null>(null);
  const [enemyRace, setEnemyRace] = useState<Race | null>(null);

  function handleAnalyze() {
    if (myRace && enemyRace) router.push(`/matchup/${myRace}-vs-${enemyRace}`);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-4">Warcraft III: Reforged</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Strategy Advisor
        </h1>
        <p className="mt-4 text-base text-white/50 max-w-xl mx-auto leading-relaxed">
          Select your race and your opponent&apos;s race to get unit counter-picks,
          hero picks, and a complete build order — driven by WC3&apos;s damage &amp; armor matrix.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 space-y-12">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">Step 1</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-sm font-medium text-white/70">Your Race</span>
            {myRace && (
              <span className="ml-auto text-xs text-amber-400/80 font-medium">{RACE_LABELS[myRace]} selected</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RACES.map((race) => (
              <RaceCard key={race} race={race} selected={myRace === race} onClick={setMyRace} />
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">Step 2</span>
            <span className="text-white/20 text-xs">·</span>
            <span className={`text-sm font-medium ${myRace ? "text-white/70" : "text-white/20"}`}>Enemy Race</span>
            {enemyRace && (
              <span className="ml-auto text-xs text-red-400/80 font-medium">{RACE_LABELS[enemyRace]} (enemy)</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RACES.map((race) => (
              <RaceCard key={race} race={race} selected={enemyRace === race} disabled={!myRace} onClick={setEnemyRace} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleAnalyze}
            disabled={!myRace || !enemyRace}
            className={`
              px-8 py-3.5 rounded-2xl font-semibold text-sm tracking-tight transition-all duration-200
              ${myRace && enemyRace
                ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] cursor-pointer shadow-lg shadow-amber-500/20"
                : "bg-white/[0.06] text-white/25 cursor-not-allowed"
              }
            `}
          >
            {myRace && enemyRace
              ? `Analyze ${RACE_LABELS[myRace]} vs ${RACE_LABELS[enemyRace]}`
              : "Select both races to continue"}
          </button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-4">
          {[
            { title: "Damage Matrix", desc: "Every matchup scored using the full WC3 attack vs armor multiplier table." },
            { title: "Counter-Picks",  desc: "See which units deal bonus damage to your opponent's specific army comp." },
            { title: "Build Orders",   desc: "Step-by-step timings for all 16 race matchup combinations." },
          ].map((card) => (
            <div key={card.title} className="bg-white/[0.05] border border-white/[0.09] rounded-2xl p-5">
              <p className="font-semibold text-sm text-white/80 mb-1.5">{card.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
