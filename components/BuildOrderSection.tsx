"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BuildOrder } from "@/data/build-orders";
import type { Race } from "@/data/units";
import BuildOrderTimeline from "@/components/BuildOrderTimeline";
import { loadCustomBuilds } from "@/lib/custom-builds";

interface Props {
  officialBuilds: BuildOrder[];
  myRace: Race;
  enemyRace: Race;
  raceLabel: string;
  enemyLabel: string;
}

export default function BuildOrderSection({ officialBuilds, myRace, enemyRace, raceLabel, enemyLabel }: Props) {
  const [allBuilds, setAllBuilds] = useState<BuildOrder[]>(officialBuilds);

  useEffect(() => {
    const custom = loadCustomBuilds().filter(
      (b) => b.myRace === myRace && b.enemyRace === enemyRace
    );
    setAllBuilds([...officialBuilds, ...custom]);
  }, [myRace, enemyRace, officialBuilds]);

  if (!allBuilds.length) return null;

  const customCount = allBuilds.length - officialBuilds.length;

  return (
    <section>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Build Order</p>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-xs text-white/35">{raceLabel} vs {enemyLabel}</span>
        {allBuilds.length > 1 && (
          <span className="text-[10px] text-white/25">{allBuilds.length} builds available</span>
        )}
        {customCount > 0 && (
          <span className="text-[10px] text-amber-400/60 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            {customCount} custom
          </span>
        )}
        <Link
          href="/builder"
          className="ml-auto text-[10px] text-white/25 hover:text-amber-400/70 transition-colors"
        >
          + Create Build
        </Link>
      </div>
      <BuildOrderTimeline buildOrders={allBuilds} />
    </section>
  );
}
