import { notFound } from "next/navigation";
import Link from "next/link";
import { computeMatchup } from "@/lib/matchup-engine";
import { getBuildOrders } from "@/data/build-orders";
import { RACE_LABELS, type Race } from "@/data/units";
import BuildOrderSection from "@/components/BuildOrderSection";
import { DamageMatrix } from "@/components/DamageMatrix";
import { CompositionAnalyzer } from "@/components/CompositionAnalyzer";
import { getMatchupGuides } from "@/data/matchup-guides";

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
  return {
    title: `${RACE_LABELS[parsed.myRace]} vs ${RACE_LABELS[parsed.enemyRace]} — WC3 Strategy`,
  };
}

function Hr() {
  return <div className="h-px bg-white/[0.07]" />;
}

function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-mono text-[10px] tracking-[0.25em] text-white/20 tabular-nums flex-shrink-0">
        {index}
      </span>
      <div className="flex-1 h-px bg-white/[0.07]" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 flex-shrink-0">
        {label}
      </span>
    </div>
  );
}

export default async function MatchupPage({
  params,
}: {
  params: Promise<{ races: string }>;
}) {
  const { races } = await params;
  const parsed = parseRaces(races);
  if (!parsed) notFound();

  const { myRace, enemyRace } = parsed;
  const result = computeMatchup(myRace, enemyRace);
  const buildOrders = getBuildOrders(myRace, enemyRace);
  const guides = getMatchupGuides(myRace, enemyRace);

  return (
    <div className="min-h-screen">

      {/* ── Banner ─────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 py-10 sm:py-14">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 hover:text-white/55 transition-colors mb-8"
          >
            ← Race Select
          </Link>

          {/* Race matchup heading */}
          <div className="flex items-end gap-4 sm:gap-6 flex-wrap mb-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/30 mb-2">
                Playing as
              </p>
              <h1
                style={{ fontFamily: "var(--font-cinzel)" }}
                className="text-3xl sm:text-5xl font-black leading-none tracking-tight text-white"
              >
                {RACE_LABELS[myRace]}
              </h1>
            </div>

            <p
              style={{ fontFamily: "var(--font-cinzel)" }}
              className="text-2xl sm:text-3xl text-white/20 mb-0.5"
            >
              vs
            </p>

            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/30 mb-2">
                Facing
              </p>
              <h2
                style={{ fontFamily: "var(--font-cinzel)" }}
                className="text-3xl sm:text-5xl font-black leading-none tracking-tight text-white/45"
              >
                {RACE_LABELS[enemyRace]}
              </h2>
            </div>
          </div>

          {/* Analysis text */}
          <p className="text-xs text-white/35 max-w-2xl leading-relaxed hidden sm:block mb-5">
            {result.generalAnalysis}
          </p>

          {/* Quick-facts strip */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.1em] uppercase">
            <span>
              <span className="text-white/20">Top unit </span>
              <span className="text-emerald-400/80">{result.topUnits[0]?.name ?? "—"}</span>
            </span>
            <span>
              <span className="text-white/20">Hero </span>
              <span className="text-amber-400/80">{result.topHeroes[0]?.name ?? "—"}</span>
            </span>
            {result.keyThreats[0] && (
              <span>
                <span className="text-white/20">Threat </span>
                <span className="text-red-400/70">
                  {result.keyThreats[0].split("(")[0].trim()}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 py-10 sm:py-14 space-y-14">

        {/* 01 — Composition */}
        <section>
          <SectionHead index="01" label="Enemy Composition & Counter-Picks" />
          <CompositionAnalyzer
            myRace={myRace}
            enemyRace={enemyRace}
            defaultResult={result}
          />
        </section>

        <Hr />

        {/* 02 — Build Order */}
        <section>
          <SectionHead index="02" label={`Build Order · ${RACE_LABELS[myRace]} vs ${RACE_LABELS[enemyRace]}`} />
          <BuildOrderSection
            officialBuilds={buildOrders}
            myRace={myRace}
            enemyRace={enemyRace}
            raceLabel={RACE_LABELS[myRace]}
            enemyLabel={RACE_LABELS[enemyRace]}
          />
        </section>

        <Hr />

        {/* 03 — Damage matrix */}
        <section>
          <SectionHead index="03" label="Damage vs Armor Matrix" />
          <p className="text-xs text-white/30 -mt-2 mb-5 leading-relaxed">
            Full WC3 multiplier table. Hover a cell for details.
          </p>
          <DamageMatrix />
        </section>

        <Hr />

        {/* 04 — Matchup guides */}
        {guides.length > 0 && (
          <>
            <Hr />
            <section>
              <SectionHead index="04" label="Matchup Guides" />
              <div className="flex flex-wrap gap-2.5">
                {guides.map((g) => (
                  <Link
                    key={g.url}
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-500/30 transition-colors px-4 py-3 max-w-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-amber-500/50 group-hover:text-amber-400/70 transition-colors flex-shrink-0">
                        {g.source}
                      </span>
                      <span className="text-white/10 font-thin">·</span>
                      <span className="text-[11px] font-medium text-white/60 group-hover:text-white/90 transition-colors leading-tight">
                        {g.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/25 leading-snug">{g.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        <Hr />

        {/* 05 — Other matchups */}
        <section>
          <SectionHead index={guides.length > 0 ? "05" : "04"} label="Other Matchups" />
          <div className="grid grid-cols-3 gap-3">
            {(["human", "orc", "nightelf", "undead"] as Race[])
              .filter((e) => e !== enemyRace)
              .map((enemy) => (
                <Link
                  key={enemy}
                  href={`/matchup/${myRace}-vs-${enemy}`}
                  className="group border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-colors px-5 py-4"
                >
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-1.5 group-hover:text-white/35 transition-colors">
                    vs
                  </p>
                  <p
                    style={{ fontFamily: "var(--font-cinzel)" }}
                    className="text-sm font-bold text-white/60 group-hover:text-white/90 transition-colors"
                  >
                    {RACE_LABELS[enemy]}
                  </p>
                </Link>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
}
