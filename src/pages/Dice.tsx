import { useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import { powerRollTier } from "@contracts/game";
import { cn } from "@/lib/utils";

interface RollLog {
  id: number;
  label: string;
  detail: string;
  total: number;
  tier?: 1 | 2 | 3;
  ts: number;
}

const TIER_STYLE = {
  1: "border-slate-400/40 text-slate-300",
  2: "border-[rgba(240,192,64,0.45)] text-[var(--gold)]",
  3: "border-[rgba(214,60,42,0.5)] text-[var(--crimson-soft)]",
} as const;

const DICE = [3, 4, 6, 8, 10, 12, 20];

let logId = 0;

export default function Dice() {
  const [modifier, setModifier] = useState(0);
  const [edges, setEdges] = useState(0); // positive = edges, negative = banes
  const [log, setLog] = useState<RollLog[]>([]);
  const [rolling, setRolling] = useState(false);
  const [lastFaces, setLastFaces] = useState<[number, number] | null>(null);

  function pushLog(entry: Omit<RollLog, "id" | "ts">) {
    setLog((prev) => [{ ...entry, id: ++logId, ts: Date.now() }, ...prev].slice(0, 30));
  }

  function rollPower() {
    setRolling(true);
    setLastFaces(null);
    setTimeout(() => {
      const d1 = 1 + Math.floor(Math.random() * 10);
      const d2 = 1 + Math.floor(Math.random() * 10);
      // Draw Steel: each edge adds +2, each bane subtracts 2
      const total = d1 + d2 + modifier + edges * 2;
      const tier = powerRollTier(total);
      setLastFaces([d1, d2]);
      pushLog({
        label: "Power Roll",
        detail: `2d10 (${d1}+${d2}) ${modifier ? `${modifier >= 0 ? "+" : ""}${modifier}` : ""}${edges ? `, ${edges > 0 ? `${edges} edge${edges > 1 ? "s" : ""}` : `${-edges} bane${-edges > 1 ? "s" : ""}`}` : ""}`,
        total,
        tier,
      });
      setRolling(false);
    }, 450);
  }

  function rollDie(sides: number) {
    const v = 1 + Math.floor(Math.random() * sides);
    pushLog({ label: `d${sides}`, detail: "", total: v });
  }

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
          2d10, edges and banes
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
          Draw Steel Dice Roller
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate)]">
          Draw Steel runs on 2d10 power rolls: 11 or lower is tier 1, 12–16 is
          tier 2, 17 or higher is tier 3. Each edge adds +2 to the roll, each
          bane subtracts 2.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Power roll */}
            <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-6">
              <h2 className="font-display text-xl font-bold">Power Roll</h2>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slate)]">Modifier</span>
                  <div className="flex items-center gap-1">
                    {[-2, -1, 0, 1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        onClick={() => setModifier(m)}
                        className={cn(
                          "h-11 w-11 rounded border text-sm font-semibold",
                          modifier === m
                            ? "border-[var(--gold)] bg-[rgba(240,192,64,0.15)] text-[var(--gold)]"
                            : "border-[var(--line-soft)] text-[var(--slate)] hover:text-[var(--paper)]",
                        )}
                      >
                        {m > 0 ? `+${m}` : m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slate)]">Edges / Banes</span>
                  <div className="flex items-center gap-1">
                    {[-2, -1, 0, 1, 2].map((e) => (
                      <button
                        key={e}
                        onClick={() => setEdges(e)}
                        className={cn(
                          "h-11 w-14 rounded border text-sm font-semibold",
                          edges === e
                            ? "border-[var(--gold)] bg-[rgba(240,192,64,0.15)] text-[var(--gold)]"
                            : "border-[var(--line-soft)] text-[var(--slate)] hover:text-[var(--paper)]",
                        )}
                      >
                        {e === 0 ? "—" : e > 0 ? `${e}E` : `${-e}B`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <button
                  onClick={rollPower}
                  disabled={rolling}
                  className="flex h-14 items-center gap-3 rounded-lg bg-[var(--crimson)] px-8 text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  <Dices className={cn("h-6 w-6", rolling && "animate-spin")} />
                  Roll 2d10
                </button>
                {lastFaces && (
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {lastFaces.map((f, i) => (
                        <div
                          key={i}
                          className="die-face flex h-16 w-16 items-center justify-center bg-[var(--parchment)] font-num text-3xl text-[var(--parchment-ink)]"
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                    {log[0]?.tier && (
                      <div className={cn("rounded-lg border-2 px-4 py-2", TIER_STYLE[log[0].tier])}>
                        <div className="font-num text-4xl leading-none">{log[0].total}</div>
                        <div className="text-xs font-bold uppercase tracking-widest">
                          Tier {log[0].tier}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded border border-slate-400/30 px-2 py-2 text-slate-300">
                  <span className="font-num text-lg">≤ 11</span>
                  <div>Tier 1</div>
                </div>
                <div className="rounded border border-[rgba(240,192,64,0.35)] px-2 py-2 text-[var(--gold)]">
                  <span className="font-num text-lg">12 – 16</span>
                  <div>Tier 2</div>
                </div>
                <div className="rounded border border-[rgba(214,60,42,0.4)] px-2 py-2 text-[var(--crimson-soft)]">
                  <span className="font-num text-lg">17 +</span>
                  <div>Tier 3</div>
                </div>
              </div>
            </div>

            {/* Polyhedral */}
            <div className="mt-6 rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-6">
              <h2 className="font-display text-xl font-bold">Polyhedral Dice</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {DICE.map((s) => (
                  <button
                    key={s}
                    onClick={() => rollDie(s)}
                    className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--line-soft)] font-num text-xl text-[var(--paper)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    d{s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Log */}
          <aside className="self-start rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Roll History</h2>
              {log.length > 0 && (
                <button
                  onClick={() => setLog([])}
                  className="flex items-center gap-1 text-xs text-[var(--slate)] hover:text-[var(--crimson-soft)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
            {log.length === 0 ? (
              <p className="mt-4 rounded border border-dashed border-[var(--line-soft)] p-6 text-center text-xs text-[var(--slate)]">
                Nothing rolled yet. Your last 30 rolls appear here.
              </p>
            ) : (
              <ul className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
                {log.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded border border-[var(--line-soft)] bg-[var(--ink-3)] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{r.label}</div>
                      {r.detail && (
                        <div className="truncate text-[10px] text-[var(--slate)]">{r.detail}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {r.tier && (
                        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold", TIER_STYLE[r.tier])}>
                          T{r.tier}
                        </span>
                      )}
                      <span className="font-num text-2xl text-[var(--gold)]">{r.total}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </Layout>
  );
}
