"use client";

import { useState } from "react";
import Image from "next/image";
import type { Unit, UnitAbility, UnitUpgrade } from "@/data/units";
import {
  formatArmor,
  formatCooldown,
  formatDamage,
  formatSpeed,
  speedLabel,
} from "@/data/units";
import { ATTACK_TYPE_LABELS, ARMOR_TYPE_LABELS } from "@/data/damage-matrix";
import { getAbilityIconCandidates, getUnitIcon } from "@/data/icons";
import { cn } from "@/lib/utils";

export function IconWithFallback({
  candidates,
  alt,
  size = 32,
  className,
}: {
  candidates: string[];
  alt: string;
  size?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const src = allFailed ? null : (candidates[idx] ?? null);

  // All candidates exhausted — render a silent placeholder
  if (!src) {
    return (
      <div
        className={cn("relative flex-shrink-0 border border-white/[0.06] bg-white/[0.03]", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("relative flex-shrink-0 overflow-hidden border border-white/10 bg-black/40", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
        onError={() => {
          if (idx + 1 < candidates.length) {
            setIdx((i) => i + 1);
          } else {
            setAllFailed(true);
          }
        }}
      />
    </div>
  );
}

export function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-[11px]">
      <span className="text-white/40 shrink-0">{label}</span>
      <span className="text-white/80 text-right">{value}</span>
    </div>
  );
}

export function AbilityBlock({ ability }: { ability: UnitAbility }) {
  const candidates = getAbilityIconCandidates(ability.iconKey, ability.name);
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-950/30 border-b border-white/[0.06]">
        <IconWithFallback candidates={candidates} alt={ability.name} size={28} />
        <span className="font-semibold text-xs text-amber-200/90">{ability.name}</span>
        {ability.hotkey && (
          <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">{ability.hotkey}</span>
        )}
      </div>
      <div className="px-2.5 py-2 space-y-1.5">
        {(ability.castType || ability.targetType) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-white/35">
            {ability.castType && <span>Cast: {ability.castType}</span>}
            {ability.targetType && <span>Target: {ability.targetType}</span>}
          </div>
        )}
        {ability.description && (
          <p className="text-[11px] text-white/55 leading-relaxed">
            {ability.description.replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2")}
          </p>
        )}
        {ability.fields.map((f) => (
          <StatRow key={`${f.label}-${f.value}`} label={f.label} value={f.value} />
        ))}
        {ability.researchedAt && <StatRow label="Researched at" value={ability.researchedAt} />}
        {ability.researchCost && (
          <StatRow
            label="Research cost"
            value={
              [
                ability.researchCost.gold ? `${ability.researchCost.gold}g` : null,
                ability.researchCost.lumber ? `${ability.researchCost.lumber}l` : null,
                ability.researchCost.time ? `${ability.researchCost.time}s` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"
            }
          />
        )}
      </div>
    </div>
  );
}

export function UpgradeBlock({ upgrade }: { upgrade: UnitUpgrade }) {
  const candidates = getAbilityIconCandidates(upgrade.iconKey, upgrade.name);
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-purple-950/30 border-b border-white/[0.06]">
        <IconWithFallback candidates={candidates} alt={upgrade.name} size={28} />
        <span className="font-semibold text-xs text-purple-200/90">{upgrade.name}</span>
        {upgrade.hotkey && (
          <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">{upgrade.hotkey}</span>
        )}
      </div>
      <div className="px-2.5 py-2 space-y-2">
        {upgrade.description && (
          <p className="text-[11px] text-white/55 leading-relaxed">{upgrade.description}</p>
        )}
        {upgrade.researchedAt && <StatRow label="Researched at" value={upgrade.researchedAt} />}
        {upgrade.levels.map((lvl) => (
          <div key={lvl.name} className="rounded border border-white/[0.06] bg-black/20 p-2 space-y-1">
            <p className="text-[11px] font-medium text-white/70">{lvl.name}</p>
            {lvl.requires && <StatRow label="Requires" value={lvl.requires} />}
            {(lvl.gold || lvl.lumber || lvl.researchTime) && (
              <StatRow
                label="Cost"
                value={[lvl.gold ? `${lvl.gold}g` : null, lvl.lumber ? `${lvl.lumber}l` : null, lvl.researchTime ? `${lvl.researchTime}s` : null]
                  .filter(Boolean)
                  .join(" · ")}
              />
            )}
            {lvl.effects.map((e) => (
              <StatRow key={`${lvl.name}-${e.label}`} label={e.label} value={e.value} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function combatAbilities(unit: Unit) {
  return unit.abilities.filter((a) => a.name !== "Gather" && !a.name.startsWith("Unit Inventory"));
}

export function UnitStatsGrid({ unit, dense }: { unit: Unit; dense?: boolean }) {
  return (
    <div className={cn("space-y-3", dense && "space-y-2")}>
      <section>
        <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Unit Information</p>
        <div className="space-y-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
          <StatRow label="Cost" value={`${unit.goldCost}g · ${unit.foodCost} food${unit.buildTime ? ` · ${unit.buildTime}s` : ""}`} />
          <StatRow label="Hit Points" value={unit.hp} />
          {unit.hpRegen && <StatRow label="HP Regeneration" value={unit.hpRegen} />}
          <StatRow label="Armor" value={`${formatArmor(unit)} (${ARMOR_TYPE_LABELS[unit.armorType]})`} />
          {unit.level && <StatRow label="Level" value={unit.level} />}
          {unit.builtFrom && <StatRow label="Built From" value={unit.builtFrom} />}
          {unit.daySight && <StatRow label="Sight" value={`${unit.daySight} / ${unit.nightSight ?? "—"}`} />}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Movement</p>
        <div className="space-y-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
          <StatRow label="Speed" value={`${formatSpeed(unit)} (${speedLabel(unit.speedUpgraded ?? unit.speed)})`} />
          {unit.turnRate && <StatRow label="Turn Rate" value={unit.turnRate} />}
          {unit.moveType && <StatRow label="Move Type" value={unit.moveType} />}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Combat</p>
        <div className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-2">
          <StatRow label="Damage" value={formatDamage(unit)} />
          <StatRow label="DPS" value={unit.dpsUpgraded ? `${unit.dps} (${unit.dpsUpgraded})` : unit.dps} />
          <StatRow label="Attack Type" value={ATTACK_TYPE_LABELS[unit.attackType]} />
          <StatRow label="Cooldown" value={formatCooldown(unit)} />
          <StatRow label="Range" value={unit.range} />
          {unit.weaponType && <StatRow label="Weapon Type" value={unit.weaponType} />}
          {unit.targets && unit.targets.length > 0 && (
            <StatRow label="Targets" value={unit.targets.join(", ")} />
          )}
        </div>
      </section>
    </div>
  );
}

export function UnitAbilitiesSection({ unit }: { unit: Unit }) {
  const abilities = combatAbilities(unit);
  if (abilities.length === 0 && unit.upgrades.length === 0) return null;

  return (
    <div className="space-y-3">
      {abilities.length > 0 && (
        <section>
          <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Spell &amp; Abilities</p>
          <div className="space-y-2">
            {abilities.map((a) => (
              <AbilityBlock key={a.name} ability={a} />
            ))}
          </div>
        </section>
      )}
      {unit.upgrades.length > 0 && (
        <section>
          <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Upgrades</p>
          <div className="space-y-2">
            {unit.upgrades.map((u) => (
              <UpgradeBlock key={u.name} upgrade={u} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function UnitDetailContent({ unit, showLore }: { unit: Unit; showLore?: boolean }) {
  return (
    <div className="space-y-4">
      <UnitStatsGrid unit={unit} />
      <UnitAbilitiesSection unit={unit} />
      {showLore && unit.lore && (
        <section>
          <p className="text-[10px] font-medium tracking-widest uppercase text-white/40 mb-1.5">Overview</p>
          <p className="text-[11px] text-white/45 leading-relaxed">{unit.lore}</p>
        </section>
      )}
    </div>
  );
}

export function UnitDetailHeader({ unit }: { unit: Unit }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-3 py-2.5">
      <IconWithFallback candidates={[getUnitIcon(unit.id)]} alt={unit.name} size={36} />
      <div>
        <p className="font-semibold text-sm text-white">{unit.name}</p>
        <p className="text-[10px] text-white/40">
          {unit.builtFrom ? `Built from ${unit.builtFrom}` : "Unit"}
          {unit.level ? ` · Level ${unit.level}` : ""}
        </p>
      </div>
    </div>
  );
}

/** Compact combat block for hover tooltip — always shown outside scroll area */
export function UnitCombatSummary({ unit }: { unit: Unit }) {
  return (
    <section className="px-3 pb-2.5">
      <p className="text-[10px] font-medium tracking-widest uppercase text-amber-500/70 mb-1.5">Combat</p>
      <div className="space-y-1 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-2">
        <StatRow label="Damage" value={formatDamage(unit)} />
        <StatRow label="DPS" value={unit.dpsUpgraded ? `${unit.dps} (${unit.dpsUpgraded})` : unit.dps} />
        <StatRow label="Attack" value={ATTACK_TYPE_LABELS[unit.attackType]} />
        <StatRow label="Armor" value={`${formatArmor(unit)} · ${ARMOR_TYPE_LABELS[unit.armorType]}`} />
        <StatRow label="HP" value={unit.hp} />
        <StatRow label="Cooldown" value={formatCooldown(unit)} />
        <StatRow label="Range" value={unit.range} />
      </div>
    </section>
  );
}

// ── Compact ability block (for expanded unit row) ────────────────────────────
function CompactAbilityBlock({ ability }: { ability: UnitAbility }) {
  const candidates = getAbilityIconCandidates(ability.iconKey, ability.name);
  const meta = [ability.castType, ability.targetType].filter(Boolean).join(" · ");

  return (
    <div className="border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <IconWithFallback candidates={candidates} alt={ability.name} size={24} />
        <span className="font-semibold text-xs text-amber-200/80 flex-1 min-w-0">{ability.name}</span>
        {ability.hotkey && (
          <span className="font-mono text-[10px] text-white/25 bg-white/[0.06] px-1.5 py-0.5 flex-shrink-0">{ability.hotkey}</span>
        )}
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {meta && <p className="font-mono text-[10px] text-white/25">{meta}</p>}
        {ability.description && (
          <p className="text-[11px] text-white/50 leading-relaxed">
            {ability.description.replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2")}
          </p>
        )}
        {(ability.fields.length > 0 || ability.researchedAt || ability.researchCost) && (
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-0.5">
            {ability.fields.map((f) => (
              <span key={f.label} className="text-[10px]">
                <span className="text-white/30">{f.label}:</span>{" "}
                <span className="text-white/55">{f.value}</span>
              </span>
            ))}
            {ability.researchedAt && (
              <span className="text-[10px]">
                <span className="text-white/30">At:</span>{" "}
                <span className="text-white/55">{ability.researchedAt}</span>
              </span>
            )}
            {ability.researchCost && (
              <span className="text-[10px] text-amber-400/60">
                {[
                  ability.researchCost.gold   ? `${ability.researchCost.gold}g`   : null,
                  ability.researchCost.lumber ? `${ability.researchCost.lumber}l` : null,
                  ability.researchCost.time   ? `${ability.researchCost.time}s`   : null,
                ].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CompactUpgradeBlock({ upgrade }: { upgrade: UnitUpgrade }) {
  const candidates = getAbilityIconCandidates(upgrade.iconKey, upgrade.name);
  return (
    <div className="border border-white/[0.07] overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <IconWithFallback candidates={candidates} alt={upgrade.name} size={24} />
        <span className="font-semibold text-xs text-purple-200/70 flex-1 min-w-0">{upgrade.name}</span>
        {upgrade.hotkey && (
          <span className="font-mono text-[10px] text-white/25 bg-white/[0.06] px-1.5 py-0.5 flex-shrink-0">{upgrade.hotkey}</span>
        )}
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {upgrade.description && (
          <p className="text-[11px] text-white/45 leading-relaxed">{upgrade.description}</p>
        )}
        {upgrade.researchedAt && (
          <p className="text-[10px] text-white/30">
            Researched at: <span className="text-white/50">{upgrade.researchedAt}</span>
          </p>
        )}
        {upgrade.levels.map((lvl) => {
          const parts = [
            lvl.gold         ? `${lvl.gold}g`         : null,
            lvl.lumber       ? `${lvl.lumber}l`        : null,
            lvl.researchTime ? `${lvl.researchTime}s`  : null,
          ].filter(Boolean);
          return (
            <div key={lvl.name} className="pt-0.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-white/60">{lvl.name}</span>
                {parts.length > 0 && (
                  <span className="text-[10px] text-amber-400/60">{parts.join(" · ")}</span>
                )}
                {lvl.requires && (
                  <span className="text-[10px] text-white/25">Req: {lvl.requires}</span>
                )}
              </div>
              {lvl.effects.length > 0 && (
                <p className="text-[10px] text-white/35 mt-0.5">
                  {lvl.effects.map((e) => `${e.label}: ${e.value}`).join(" · ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollapsibleLore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const preview = text.slice(0, 120).trimEnd();
  const hasMore = text.length > 120;
  return (
    <div className="border-t border-white/[0.05] pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 hover:text-white/45 transition-colors mb-2"
      >
        <span>{open ? "▲" : "▼"}</span>
        <span>Overview</span>
      </button>
      {open ? (
        <p className="text-[11px] text-white/30 leading-relaxed italic">{text}</p>
      ) : hasMore ? (
        <p className="text-[11px] text-white/25 leading-relaxed italic">
          {preview}…{" "}
          <button onClick={() => setOpen(true)} className="text-white/35 hover:text-white/55 not-italic underline underline-offset-2 decoration-white/20">
            read more
          </button>
        </p>
      ) : (
        <p className="text-[11px] text-white/30 leading-relaxed italic">{text}</p>
      )}
    </div>
  );
}

/** Compact unit detail for the expanded UnitRow panel */
export function CompactUnitDetail({ unit }: { unit: Unit }) {
  const abilities = unit.abilities.filter(
    (a) => a.name !== "Gather" && !a.name.startsWith("Unit Inventory")
  );

  const left: [string, React.ReactNode][] = [
    ["HP",      <span key="hp" className="text-emerald-400">{unit.hp}</span>],
    ["Damage",  <span key="dmg" className="text-red-400/90">{formatDamage(unit)}</span>],
    ["DPS",     <span key="dps" className="text-red-400/70">{unit.dpsUpgraded ? `${unit.dps} (${unit.dpsUpgraded})` : unit.dps}</span>],
    ["Attack",  ATTACK_TYPE_LABELS[unit.attackType]],
    ["Armor",   <span key="arm" className="text-blue-400/80">{`${formatArmor(unit)} · ${ARMOR_TYPE_LABELS[unit.armorType]}`}</span>],
  ];
  const right: [string, React.ReactNode][] = [
    ["Speed",    `${formatSpeed(unit)} (${speedLabel(unit.speedUpgraded ?? unit.speed)})`],
    ["Range",    String(unit.range)],
    ["Cooldown", formatCooldown(unit)],
    ["Cost",     <span key="cost" className="text-amber-400/75">{`${unit.goldCost}g · ${unit.foodCost} food${unit.buildTime ? ` · ${unit.buildTime}s` : ""}`}</span>],
    ...(unit.targets && unit.targets.length > 0
      ? [["Targets", unit.targets.join(" · ")] as [string, React.ReactNode]]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Flat 2-col stat grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
        <div className="space-y-1.5">
          {left.map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-3 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {right.map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-3 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Abilities */}
      {abilities.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500/50">Abilities</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="space-y-3.5">
            {abilities.map((a) => <CompactAbilityBlock key={a.name} ability={a} />)}
          </div>
        </div>
      )}

      {/* Upgrades */}
      {unit.upgrades.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-purple-400/50">Upgrades</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="space-y-3.5">
            {unit.upgrades.map((u) => <CompactUpgradeBlock key={u.name} upgrade={u} />)}
          </div>
        </div>
      )}

      {/* Collapsible lore */}
      {unit.lore && <CollapsibleLore text={unit.lore} />}
    </div>
  );
}

/** Wide 2-column stat grid for the hover tooltip */
export function UnitTooltipStats({ unit }: { unit: Unit }) {
  type Row = { label: string; value: React.ReactNode };

  const rows: Row[] = [
    { label: "HP",       value: <span className="text-emerald-400">{unit.hp}</span> },
    { label: "Damage",   value: <span className="text-red-400/90">{formatDamage(unit)}</span> },
    { label: "DPS",      value: <span className="text-red-400/70">{unit.dpsUpgraded ? `${unit.dps} (${unit.dpsUpgraded})` : unit.dps}</span> },
    { label: "Attack",   value: ATTACK_TYPE_LABELS[unit.attackType] },
    { label: "Armor",    value: <span className="text-blue-400/80">{`${formatArmor(unit)} · ${ARMOR_TYPE_LABELS[unit.armorType]}`}</span> },
    { label: "Range",    value: unit.range },
    { label: "Cooldown", value: formatCooldown(unit) },
    ...(unit.targets && unit.targets.length > 0
      ? [{ label: "Targets", value: unit.targets.join(" · ") }]
      : []),
    { label: "Speed",    value: formatSpeed(unit) },
    { label: "Cost",     value: <span className="text-amber-400/75">{unit.goldCost}g · {unit.foodCost} food</span> },
  ];

  const mid = Math.ceil(rows.length / 2);
  const left = rows.slice(0, mid);
  const right = rows.slice(mid);

  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
        <div className="px-4 py-3 space-y-1.5">
          {left.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 space-y-1.5">
          {right.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 text-[11px]">
              <span className="text-white/35 flex-shrink-0">{label}</span>
              <span className="text-white/75 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {unit.special.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-2">
          <span className="font-mono text-[10px] text-white/25 tracking-[0.05em]">
            {unit.special.join(" · ")}
          </span>
        </div>
      )}
    </>
  );
}
