import { useState } from "react";
import { Link } from "react-router";
import { Minus, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import {
  difficultyBands,
  effectiveHeroes,
  heroES,
  partyES,
} from "@contracts/game";
import { cn } from "@/lib/utils";

const DIFF_CLS: Record<string, string> = {
  trivial: "text-slate-300",
  easy: "text-emerald-300",
  standard: "text-[var(--gold)]",
  hard: "text-orange-300",
  extreme: "text-[var(--crimson-soft)]",
};

function Row({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--line-soft)] hover:bg-[var(--ink-3)] disabled:opacity-30"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-num w-12 text-center text-3xl text-[var(--gold)]">{value}</span>
        <button
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--line-soft)] hover:bg-[var(--ink-3)] disabled:opacity-30"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Calculator() {
  const [heroes, setHeroes] = useState(4);
  const [level, setLevel] = useState(1);
  const [victories, setVictories] = useState(0);

  const es = partyES(heroes, level, victories);
  const h = heroES(level);
  const eff = effectiveHeroes(heroes, victories);
  const bands = difficultyBands(heroes, level, victories);

  // Quick-build hero slots per difficulty (official quick encounter building)
  const slotAdjust: Record<string, number> = {
    trivial: -2,
    easy: -1,
    standard: 0,
    hard: 2,
    extreme: 4,
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
          Reverse the math
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
          Draw Steel Encounter Calculator &amp; Budget Tool
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate)]">
          Enter your party's size, level and Victories — get the encounter
          strength, every difficulty budget, and how many creatures of each
          organization fill it. All formulas straight from the Draw Steel rules.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="space-y-3 self-start">
            <Row label="Heroes" value={heroes} onChange={setHeroes} min={1} max={8} />
            <Row label="Hero level" value={level} onChange={setLevel} min={1} max={10} />
            <Row label="Avg. Victories" value={victories} onChange={setVictories} min={0} max={30} />
            <div className="rounded-lg border border-[var(--line)] bg-[var(--ink-3)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
                Party Encounter Strength
              </div>
              <div className="font-num mt-1 text-6xl text-[var(--gold)]">{es}</div>
              <p className="mt-2 text-xs leading-5 text-[var(--slate)]">
                {heroes} heroes × {h} ES each
                {eff > heroes && `, +${eff - heroes} bonus hero from ${victories} Victories`}.
                One hero at level {level} is worth {h} ES (4 + 2 × level).
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Budget by difficulty</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line-soft)]">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--line-soft)] bg-[var(--ink-2)] text-left">
                    <th className="px-4 py-3 font-semibold text-[var(--gold)]">Difficulty</th>
                    <th className="px-4 py-3 font-semibold text-[var(--gold)]">EV budget</th>
                    <th className="px-4 py-3 font-semibold text-[var(--gold)]">Hero slots</th>
                    <th className="px-4 py-3 font-semibold text-[var(--gold)]">Victories</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((b) => (
                    <tr key={b.difficulty} className="border-b border-[var(--line-soft)] last:border-0">
                      <td className={cn("px-4 py-3 font-bold", DIFF_CLS[b.difficulty])}>
                        {b.label}
                      </td>
                      <td className="px-4 py-3 font-num text-lg">
                        {b.max === Infinity ? `${b.min}+` : b.max < 0 ? "—" : `${b.min} – ${b.max}`}
                      </td>
                      <td className="px-4 py-3 text-[var(--slate)]">
                        {Math.max(1, eff + slotAdjust[b.difficulty])}
                        {b.difficulty === "extreme" && "+"}
                      </td>
                      <td className="px-4 py-3">{b.victoriesAwarded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 font-display text-xl font-bold">What fills a hero slot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { org: "Minions", fill: "8 minions fill 1 hero slot", note: "Bought four at a time; squads of up to eight." },
                { org: "Horde", fill: "2 horde creatures fill 1 hero slot", note: "Fragile — double up when they're the main event." },
                { org: "Platoon", fill: "1 platoon creature fills 1 hero slot", note: "A decent threat to a hero of the same level." },
                { org: "Elite / Leader", fill: "1 elite or leader fills 2 hero slots", note: "Leaders bring villain actions — one per fight." },
                { org: "Solo", fill: "1 solo fills 6+ hero slots", note: "An encounter all on its own. Cap at party level + 1." },
              ].map((r) => (
                <div key={r.org} className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-4">
                  <div className="font-display text-sm font-bold text-[var(--gold)]">{r.org}</div>
                  <div className="mt-1 text-sm font-semibold">{r.fill}</div>
                  <div className="mt-1 text-xs leading-5 text-[var(--slate)]">{r.note}</div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-[var(--slate)]">
              Ready to spend the budget?{" "}
              <Link to="/" className="text-[var(--gold)] underline">
                Open the Draw Steel encounter builder
              </Link>{" "}
              and pick your monsters.
            </p>
          </div>
        </div>

        {/* Full ES reference table */}
        <h2 className="mt-14 font-display text-2xl font-bold">Encounter Strength Table</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--slate)]">
          Party encounter strength by hero level and party size. Add one hero's
          worth of ES for every 2 Victories the heroes have earned on average.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--line-soft)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--line-soft)] bg-[var(--ink-2)]">
                <th className="px-3 py-2.5 text-left font-semibold text-[var(--gold)]">Level</th>
                {Array.from({ length: 8 }, (_, i) => (
                  <th key={i} className="px-3 py-2.5 text-right font-semibold text-[var(--gold)]">
                    {i + 1} hero{i > 0 ? "es" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, li) => li + 1).map((lv) => (
                <tr key={lv} className="border-b border-[var(--line-soft)] last:border-0">
                  <td className="px-3 py-2.5 font-semibold">{lv}{lv === 1 ? "st" : lv === 2 ? "nd" : lv === 3 ? "rd" : "th"}</td>
                  {Array.from({ length: 8 }, (_, hi) => hi + 1).map((hc) => (
                    <td
                      key={hc}
                      className={cn(
                        "px-3 py-2.5 text-right font-num text-base",
                        hc === heroes && lv === level
                          ? "bg-[rgba(240,192,64,0.12)] text-[var(--gold)]"
                          : "text-[var(--paper)]",
                      )}
                    >
                      {heroES(lv) * hc}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
