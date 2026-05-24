import { notFound } from "next/navigation";
import Link from "next/link";
import { computeMatchup } from "@/lib/matchup-engine";
import { getBuildOrders } from "@/data/build-orders";
import { RACE_LABELS, type Race } from "@/data/units";
import BuildOrderTimeline from "@/components/BuildOrderTimeline";
import { DamageMatrix } from "@/components/DamageMatrix";
import { CompositionAnalyzer } from "@/components/CompositionAnalyzer";

const VALID_RACES: Race[] = ["human", "orc", "nightelf", "undead"];

function parseRaces(slug: string): { myRace: Race; enemyRace: Race } | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  const [my, enemy] = parts as [Race, Race];
  if (!VALID_RACES.includes(my) || !VALID_RACES.includes(enemy)) return null;
  return { myRace: my, enemyRace: enemy };
}

export function generateStaticParams() {
  const params: { races: string }[] = [];
  for (const myRace of VALID_RACES)
    for (const enemyRace of VALID_RACES)
      params.push({ races: `${myRace}-vs-${enemyRace}` });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ races: string }> }) {
  const { races } = await params;
  const parsed = parseRaces(races);
  if (!parsed) return { title: "Not Found" };
  return { title: `${RACE_LABELS[parsed.myRace]} vs ${RACE_LABELS[parsed.enemyRace]} — WC3 Strategy` };
}

const RACE_HUE: Record<Race, string> = {
  human:    "from-blue-500/[0.07]",
  orc:      "from-red-500/[0.07]",
  nightelf: "from-purple-500/[0.07]",
  undead:   "from-slate-500/[0.05]",
};

export default async function MatchupPage({ params }: { params: Promise<{ races: string }> }) {
  const { races } = await params;
  const parsed = parseRaces(races);
  if (!parsed) notFound();

  const { myRace, enemyRace } = parsed;
  const result = computeMatchup(myRace, enemyRace);
  const buildOrders = getBuildOrders(myRace, enemyRace);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className={`border-b border-white/[0.06] bg-gradient-to-r ${RACE_HUE[myRace]} to-transparent`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
            ← Race Select
          </Link>
          <div className="flex items-end gap-3 sm:gap-5 flex-wrap">
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1">Playing as</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">{RACE_LABELS[myRace]}</h2>
            </div>
            <p className="text-xl sm:text-2xl text-white/20 mb-1">vs</p>
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-1">Facing</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-red-400">{RACE_LABELS[enemyRace]}</h2>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/45 max-w-2xl leading-relaxed hidden md:block">{result.generalAnalysis}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
              Top unit: {result.topUnits[0]?.name ?? "—"}
            </span>
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
              Hero: {result.topHeroes[0]?.name ?? "—"}
            </span>
            {result.keyThreats[0] && (
              <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 truncate max-w-[calc(100vw-3rem)]">
                ⚠ {result.keyThreats[0].split("(")[0].trim()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12 space-y-10 sm:space-y-16">

        {/* Units + Heroes via CompositionAnalyzer */}
        <CompositionAnalyzer myRace={myRace} enemyRace={enemyRace} defaultResult={result} />

        {/* Build Order */}
        {buildOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Build Order</p>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs text-white/35">{RACE_LABELS[myRace]} vs {RACE_LABELS[enemyRace]}</span>
              {buildOrders.length > 1 && (
                <span className="text-[10px] text-white/25">{buildOrders.length} builds available</span>
              )}
            </div>
            <BuildOrderTimeline buildOrders={buildOrders} />
          </section>
        )}

        {/* Damage matrix */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/40">Damage vs Armor Matrix</p>
          </div>
          <p className="text-xs text-white/30 mb-4">Complete WC3 multiplier table. Hover a cell for details.</p>
          <DamageMatrix />
        </section>

        {/* Other matchups */}
        <section>
          <p className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-4">Other Matchups</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(["human", "orc", "nightelf", "undead"] as Race[]).filter((e) => e !== enemyRace).map((enemy) => (
              <Link
                key={enemy}
                href={`/matchup/${myRace}-vs-${enemy}`}
                className="bg-white/[0.05] border border-white/[0.09] rounded-2xl p-4 text-center hover:bg-white/[0.08] transition-colors"
              >
                <p className="text-xs text-white/30 mb-0.5">vs</p>
                <p className="font-semibold text-sm text-white">{RACE_LABELS[enemy]}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
