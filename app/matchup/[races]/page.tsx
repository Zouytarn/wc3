import { notFound } from "next/navigation";
import Link from "next/link";
import { computeMatchup } from "@/lib/matchup-engine";
import { getBuildOrder } from "@/data/build-orders";
import { RACE_LABELS, UNITS_BY_RACE, type Race } from "@/data/units";
import { UnitCard } from "@/components/UnitCard";
import { HeroCard } from "@/components/HeroCard";
import { BuildOrderList } from "@/components/BuildOrderList";
import { DamageMatrix } from "@/components/DamageMatrix";

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
  for (const myRace of VALID_RACES) {
    for (const enemyRace of VALID_RACES) {
      params.push({ races: `${myRace}-vs-${enemyRace}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ races: string }> }) {
  const { races } = await params;
  const parsed = parseRaces(races);
  if (!parsed) return { title: "Not Found" };
  return {
    title: `${RACE_LABELS[parsed.myRace]} vs ${RACE_LABELS[parsed.enemyRace]} — WC3 Strategy`,
  };
}

export default async function MatchupPage({ params }: { params: Promise<{ races: string }> }) {
  const { races } = await params;
  const parsed = parseRaces(races);
  if (!parsed) notFound();

  const { myRace, enemyRace } = parsed;
  const result = computeMatchup(myRace, enemyRace);
  const buildOrder = getBuildOrder(myRace, enemyRace);
  const enemyUnits = UNITS_BY_RACE[enemyRace];

  // Split unit scores into recommended and situational/avoid
  const recommended = result.unitScores.filter((s) =>
    s.recommendation === "highly_recommended" || s.recommendation === "recommended"
  );
  const situational = result.unitScores.filter((s) => s.recommendation === "situational");
  const avoid = result.unitScores.filter((s) => s.recommendation === "avoid");

  const RACE_THEME: Record<Race, string> = {
    human:    "from-blue-950/40",
    orc:      "from-red-950/40",
    nightelf: "from-purple-950/40",
    undead:   "from-slate-900/40",
  };

  return (
    <div className="min-h-screen">
      {/* Matchup banner */}
      <div className={`border-b border-amber-900/30 bg-gradient-to-r ${RACE_THEME[myRace]} to-transparent`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-400 transition-colors"
          >
            ← Back to Race Select
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Playing as</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-400">{RACE_LABELS[myRace]}</h2>
            </div>
            <div className="text-xl sm:text-2xl text-slate-600">vs</div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Facing</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-red-400">{RACE_LABELS[enemyRace]}</h2>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl">{result.generalAnalysis}</p>

          {/* Quick summary badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-950/60 border border-green-900 px-3 py-1 text-xs text-green-400">
              Top unit: {result.topUnits[0]?.name ?? "—"}
            </span>
            <span className="rounded-full bg-amber-950/60 border border-amber-900 px-3 py-1 text-xs text-amber-400">
              Primary hero: {result.topHeroes[0]?.name ?? "—"}
            </span>
            {result.keyThreats.length > 0 && (
              <span className="rounded-full bg-red-950/60 border border-red-900 px-3 py-1 text-xs text-red-400">
                Watch: {result.keyThreats[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Tab navigation — rendered as sections for simplicity */}
        <div className="space-y-12">

          {/* === UNIT RECOMMENDATIONS === */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                🗡️ Unit Recommendations
                <span className="text-sm font-normal text-slate-600">
                  — ranked by effectiveness vs {RACE_LABELS[enemyRace]} army
                </span>
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Score combines offensive effectiveness (65% weight) and defensive durability (35% weight) using the WC3 damage/armor matrix.
              </p>
            </div>

            {/* Enemy units overview */}
            <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/10 p-4">
              <div className="text-xs font-bold text-red-500 mb-2">Enemy Army Composition ({RACE_LABELS[enemyRace]})</div>
              <div className="flex flex-wrap gap-2">
                {enemyUnits.map((u) => (
                  <span
                    key={u.id}
                    className="rounded-full bg-black/40 border border-slate-700 px-2 py-1 text-xs text-slate-400"
                    title={`${u.attackType} attack / ${u.armorType} armor`}
                  >
                    {u.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended units */}
            {recommended.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-green-500 mb-3">
                  ✓ Recommended Units ({recommended.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {recommended.map((score, idx) => (
                    <UnitCard key={score.unit.id} score={score} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Situational units */}
            {situational.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-bold text-orange-500 mb-3 list-none flex items-center gap-2 hover:text-orange-400 transition-colors">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Situational Units ({situational.length})
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {situational.map((score) => (
                    <UnitCard key={score.unit.id} score={score} />
                  ))}
                </div>
              </details>
            )}

            {/* Avoid units */}
            {avoid.length > 0 && (
              <details className="group mt-3">
                <summary className="cursor-pointer text-sm font-bold text-red-600 mb-3 list-none flex items-center gap-2 hover:text-red-500 transition-colors">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Units to Avoid ({avoid.length})
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {avoid.map((score) => (
                    <UnitCard key={score.unit.id} score={score} />
                  ))}
                </div>
              </details>
            )}
          </section>

          {/* === HERO RECOMMENDATIONS === */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                👑 Hero Recommendations
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Heroes are scored on their abilities&apos; synergy with this specific matchup.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {result.heroScores.map((score, idx) => (
                <HeroCard key={score.hero.id} score={score} rank={idx + 1} />
              ))}
            </div>
          </section>

          {/* === BUILD ORDER === */}
          {buildOrder && (
            <section>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  📋 Build Order
                  <span className="text-sm font-normal text-slate-600">
                    — {RACE_LABELS[myRace]} vs {RACE_LABELS[enemyRace]}
                  </span>
                </h3>
              </div>
              <BuildOrderList buildOrder={buildOrder} />
            </section>
          )}

          {/* === DAMAGE/ARMOR MATRIX === */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                📊 Damage vs Armor Matrix
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Complete WC3: Reforged damage multiplier matrix. Hover over any cell for details. 
                Hover over row/column headers to highlight.
              </p>
            </div>
            <DamageMatrix />
          </section>

          {/* === MATCHUP ALTERNATES === */}
          <section>
            <h3 className="text-lg font-bold text-amber-600 mb-4">Other Matchups</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["human", "orc", "nightelf", "undead"] as Race[]).map((enemy) => {
                if (enemy === enemyRace) return null;
                return (
                  <Link
                    key={enemy}
                    href={`/matchup/${myRace}-vs-${enemy}`}
                    className="rounded-lg border border-slate-800 bg-black/30 p-3 text-center text-sm hover:border-amber-700 hover:bg-amber-950/20 transition-all"
                  >
                    <div className="text-slate-400">vs</div>
                    <div className="font-bold text-amber-400">{RACE_LABELS[enemy]}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
