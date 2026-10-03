import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Flame, Plus, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import type { EncounterRow } from "@db/schema";
import { ORG_LABEL, type Monster } from "@contracts/game";
import type { MonsterRow } from "@db/schema";
import { cn } from "@/lib/utils";

const COLS = 16;
const ROWS = 12;
const CELL = 44;

interface Token {
  key: number;
  monsterId: number;
  name: string;
  org: Monster["organization"];
  x: number;
  y: number;
}

const ORG_COLOR: Record<Monster["organization"], string> = {
  minion: "#5b6472",
  horde: "#3f8f5f",
  platoon: "#2a7dfa",
  elite: "#f0c040",
  leader: "#d63c2a",
  solo: "#8f1f14",
};

let tokenKey = 0;

export type VttLoaderData = {
  monsters: MonsterRow[];
  shared: EncounterRow | null;
};

export default function Vtt({ loaderData }: { loaderData: VttLoaderData }) {
  const { monsters: monsterRows, shared: loaded } = loaderData;
  const monsters = useMemo(
    () =>
      monsterRows.map((r: MonsterRow) => ({
        id: r.id,
        name: r.name,
        organization: r.organization as Monster["organization"],
        ev: r.ev,
      })),
    [monsterRows],
  );

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<number | null>(null);
  const [malice, setMalice] = useState(0);
  const [round, setRound] = useState(1);
  const [heroCount, setHeroCount] = useState(4);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ key: number; moved: boolean } | null>(null);

  // Load encounter tokens from share link: /vtt?e=<slug> (resolved by the server loader)
  useEffect(() => {
    if (!loaded) return;
    setHeroCount(loaded.heroCount);
    setMalice(loaded.victories); // starting Malice = heroes' average Victories
    const placed: Token[] = [];
    let col = 1;
    let row = 1;
    for (const entry of loaded.lineup) {
      const m = monsters.find((mm) => mm.id === entry.monsterId);
      if (!m) continue;
      const count = Math.min(entry.count, 12);
      for (let i = 0; i < count; i++) {
        placed.push({
          key: ++tokenKey,
          monsterId: m.id,
          name: m.name,
          org: m.organization,
          x: col,
          y: row,
        });
        col += 2;
        if (col >= COLS - 1) {
          col = 1;
          row += 2;
        }
        if (row >= ROWS) break;
      }
    }
    setTokens(placed);
    toast.success(`Deployed "${loaded.name}" to the table`);
  }, [loaded, monsters]);

  function boardPos(e: React.PointerEvent): { x: number; y: number } | null {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const scale = rect.width / (COLS * CELL);
    const x = Math.floor((e.clientX - rect.left) / (CELL * scale));
    const y = Math.floor((e.clientY - rect.top) / (CELL * scale));
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
    return { x, y };
  }

  function handleBoardTap(e: React.PointerEvent) {
    if (dragRef.current?.moved) return;
    if (selectedMonster == null) return;
    const pos = boardPos(e);
    if (!pos) return;
    if (tokens.some((t) => t.x === pos.x && t.y === pos.y)) return;
    const m = monsters.find((mm) => mm.id === selectedMonster);
    if (!m) return;
    setTokens((prev) => [
      ...prev,
      { key: ++tokenKey, monsterId: m.id, name: m.name, org: m.organization, x: pos.x, y: pos.y },
    ]);
  }

  function onTokenPointerDown(key: number) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { key, moved: false };
    };
  }

  function onTokenPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const pos = boardPos(e);
    if (!pos) return;
    drag.moved = true;
    setTokens((prev) =>
      prev.map((t) => (t.key === drag.key ? { ...t, x: pos.x, y: pos.y } : t)),
    );
  }

  function onTokenPointerUp(key: number) {
    return (e: React.PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag && !drag.moved) {
        // tap = remove
        e.stopPropagation();
        setTokens((prev) => prev.filter((t) => t.key !== key));
      }
    };
  }

  function nextRound() {
    // Malice: at the start of each round, gain heroes + round number
    setMalice((m) => m + heroCount + round);
    setRound((r) => r + 1);
  }

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
          Run it in the browser
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
          Draw Steel VTT Battle Table
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate)]">
          Pick a monster, tap the grid to place tokens, drag to move, tap a
          token to remove it. Track Malice and rounds the official way: at the
          start of each round you gain Malice equal to the number of heroes
          plus the round number.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Board */}
          <div>
            <div
              ref={boardRef}
              onPointerUp={handleBoardTap}
              onPointerMove={onTokenPointerMove}
              className="vtt-grid relative w-full touch-none overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--ink-2)]"
              style={{ aspectRatio: `${COLS} / ${ROWS}`, ["--cell" as string]: `${100 / COLS}%` }}
            >
              {tokens.map((t) => (
                <div
                  key={t.key}
                  className="vtt-token absolute flex items-center justify-center rounded-full border-2 font-num text-sm text-[#0b1220]"
                  style={{
                    left: `${(t.x / COLS) * 100}%`,
                    top: `${(t.y / ROWS) * 100}%`,
                    width: `${100 / COLS}%`,
                    height: `${100 / ROWS}%`,
                    background: ORG_COLOR[t.org],
                    borderColor: "rgba(11,18,32,0.6)",
                  }}
                  onPointerDown={onTokenPointerDown(t.key)}
                  onPointerUp={onTokenPointerUp(t.key)}
                  title={`${t.name} (tap to remove)`}
                >
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {tokens.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[var(--slate)]">
                  Select a monster on the right, then tap the grid to deploy it.
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--slate)]">
              <span>Tokens: <span className="font-num text-base text-[var(--paper)]">{tokens.length}</span></span>
              <button
                onClick={() => setTokens([])}
                className="flex items-center gap-1 rounded border border-[var(--line-soft)] px-3 py-2 hover:text-[var(--crimson-soft)]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear table
              </button>
              <span className="ml-auto hidden sm:inline">Load any shared encounter: /vtt?e=slug</span>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 self-start lg:sticky lg:top-20">
            {/* Malice tracker */}
            <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Flame className="h-5 w-5 text-[var(--crimson-soft)]" /> Malice
                </h2>
                <span className="font-num text-5xl text-[var(--crimson-soft)]">{malice}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-[var(--slate)]">
                  Heroes:
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={heroCount}
                    onChange={(e) => setHeroCount(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                    className="h-9 w-14 rounded border border-[var(--line-soft)] bg-[var(--ink)] px-2 text-center text-sm text-[var(--paper)]"
                  />
                </div>
                <button
                  onClick={() => setMalice((m) => Math.max(0, m - 1))}
                  className="h-9 rounded border border-[var(--line-soft)] px-3 text-sm hover:bg-[var(--ink-3)]"
                >
                  −1
                </button>
                <button
                  onClick={() => setMalice((m) => m + 1)}
                  className="h-9 rounded border border-[var(--line-soft)] px-3 text-sm hover:bg-[var(--ink-3)]"
                >
                  +1
                </button>
              </div>
              <div className="mt-4 border-t border-[var(--line-soft)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slate)]">
                    Round
                  </span>
                  <span className="font-num text-4xl text-[var(--gold)]">{round}</span>
                </div>
                <button
                  onClick={nextRound}
                  className="mt-3 h-11 w-full rounded bg-[var(--crimson)] text-sm font-semibold text-white hover:bg-[var(--crimson-soft)]"
                >
                  Start next round (+{heroCount + round} Malice)
                </button>
                <p className="mt-2 text-[11px] leading-4 text-[var(--slate)]">
                  Official rule: each round's Malice = heroes in battle + round
                  number. Combat start: Malice = the heroes' average Victories.
                </p>
              </div>
            </div>

            {/* Monster picker */}
            <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-5">
              <h2 className="font-display text-lg font-bold">Deploy</h2>
              <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {monsters.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonster(m.id === selectedMonster ? null : m.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded border px-3 py-2.5 text-left text-sm min-h-[44px]",
                      selectedMonster === m.id
                        ? "border-[var(--gold)] bg-[rgba(240,192,64,0.1)]"
                        : "border-[var(--line-soft)] hover:bg-[var(--ink-3)]",
                    )}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: ORG_COLOR[m.organization] }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{m.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--slate)]">
                      {ORG_LABEL[m.organization]}
                    </span>
                    <Plus className="h-3.5 w-3.5 text-[var(--slate)]" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Rules primer */}
        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Running Draw Steel on a Virtual Tabletop
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--slate)]">
            Draw Steel is a tactical game: positioning, forced movement and
            terrain decide fights, so a grid with movable tokens covers most of
            what a Director needs online. This battle table is a lightweight
            Draw Steel VTT — deploy monsters as color-coded tokens (one color
            per organization: minions, hordes, elites, leaders and solos), drag
            them around the grid, and tap to remove the fallen. For the full
            rules engine with automation, pair your encounters with{" "}
            <Link to="/foundry" className="text-[var(--gold)] underline">
              Foundry VTT
            </Link>
            ; for a fast pick-up fight, this page is the whole table.
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--slate)]">
            Malice is tracked the official way. Combat starts with Malice equal
            to the heroes' average Victories — load an encounter by link and
            this is set for you. At the start of every round, the Director
            gains Malice equal to the number of heroes plus the round number:
            round 1 with four heroes is +5, round 2 is +6, and so on. Spend it
            on monster abilities, then hit "end round" to bank the next
            round's income automatically.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Draw Steel VTT FAQ
          </h2>
          <div className="mt-6 space-y-3">
            {[
              {
                q: "What is a Draw Steel VTT?",
                a: "A Draw Steel VTT (virtual tabletop) is any online table used to run Draw Steel battles remotely: a shared grid, monster tokens, and trackers for Malice and rounds. Full VTTs like Foundry run the whole game; this battle table is a free, zero-setup alternative that runs in the browser.",
              },
              {
                q: "How does Malice work in Draw Steel?",
                a: "Malice is the Director's resource for powering monster abilities. At the start of each round the Director gains Malice equal to the number of heroes in the battle plus the round number. At the start of combat, the Director's Malice equals the heroes' average Victories.",
              },
              {
                q: "Can I load a shared encounter into the battle table?",
                a: "Yes. Every encounter built in the encounter builder has a share link ending in /e/your-slug. Open /vtt?e=your-slug and the battle table deploys the monsters as tokens automatically, with starting Malice set from the party's Victories.",
              },
              {
                q: "Is this Draw Steel VTT free?",
                a: "Yes. The battle table is free, needs no account and no install — open the link on any laptop, tablet or phone and start placing tokens.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] px-5 py-4 open:border-[var(--line)]"
              >
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-semibold leading-6">
                  {f.q}
                  <span className="ml-4 text-[var(--gold)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-2 pt-1 text-sm leading-6 text-[var(--slate)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </Layout>
  );
}
