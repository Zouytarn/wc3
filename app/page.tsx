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
    if (myRace && enemyRace) {
      router.push(`/matchup/${myRace}-vs-${enemyRace}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d1a] to-[#0a0a0f]">
      {/* Hero section */}
      <div className="relative overflow-hidden border-b border-amber-900/30 bg-black/30">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-amber-950/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="mb-4 text-6xl">⚔️</div>
          <h2 className="mb-3 text-4xl font-bold text-amber-400 tracking-wide">
            WC3 Strategy Advisor
          </h2>
          <p className="text-lg text-amber-700 mb-2">
            Warcraft III: Reforged
          </p>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm leading-relaxed">
            Select your race and your opponent&apos;s race to get optimized unit counter-picks,
            hero recommendations, and a complete build order — all based on armor/damage type mathematics.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Step 1: My race */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-black">
              1
            </div>
            <h3 className="text-xl font-bold text-amber-300">Choose Your Race</h3>
            {myRace && (
              <span className="ml-2 rounded-full bg-amber-900/40 px-3 py-1 text-sm text-amber-400 border border-amber-700">
                {RACE_LABELS[myRace]} selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {RACES.map((race) => (
              <RaceCard
                key={race}
                race={race}
                selected={myRace === race}
                label="My Race"
                onClick={setMyRace}
              />
            ))}
          </div>
        </section>

        {/* Step 2: Enemy race */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                myRace ? "bg-amber-600 text-black" : "bg-slate-700 text-slate-500"
              }`}
            >
              2
            </div>
            <h3 className={`text-xl font-bold ${myRace ? "text-amber-300" : "text-slate-600"}`}>
              Choose Enemy Race
            </h3>
            {enemyRace && (
              <span className="ml-2 rounded-full bg-red-900/40 px-3 py-1 text-sm text-red-400 border border-red-700">
                {RACE_LABELS[enemyRace]} (enemy)
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {RACES.map((race) => (
              <RaceCard
                key={race}
                race={race}
                selected={enemyRace === race}
                disabled={!myRace}
                label="Enemy"
                onClick={setEnemyRace}
              />
            ))}
          </div>
        </section>

        {/* Analyze button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!myRace || !enemyRace}
            className={`
              relative px-10 py-4 rounded-lg font-bold text-lg tracking-wide transition-all duration-200
              ${
                myRace && enemyRace
                  ? "bg-gradient-to-r from-amber-700 to-amber-600 text-black hover:from-amber-600 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-900/50 hover:scale-105 active:scale-100 cursor-pointer"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }
            `}
          >
            {myRace && enemyRace
              ? `Analyze ${RACE_LABELS[myRace]} vs ${RACE_LABELS[enemyRace]} →`
              : "Select both races to continue"}
          </button>
        </div>

        {/* Info cards */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: "🎯",
              title: "Damage & Armor",
              desc: "Every matchup analyzed using the complete WC3 damage type vs armor type multiplier matrix.",
            },
            {
              icon: "🗡️",
              title: "Unit Counter-Picks",
              desc: "See which of your units deal the most damage to the specific units your enemy can field.",
            },
            {
              icon: "📋",
              title: "Build Orders",
              desc: "Step-by-step build orders for all 16 race matchup combinations with timing and priority.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-amber-900/30 bg-black/30 p-5"
            >
              <div className="mb-2 text-2xl">{card.icon}</div>
              <h4 className="mb-1 font-bold text-amber-400">{card.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
