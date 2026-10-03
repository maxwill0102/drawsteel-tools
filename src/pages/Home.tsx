import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Download,
  Link2,
  Plus,
  Minus,
  Trash2,
  Save,
  Search,
  Skull,
} from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  classifyDifficulty,
  difficultyBands,
  entryEv,
  heroES,
  lineupTotalEv,
  ORG_LABEL,
  ORGANIZATIONS,
  partyES,
  recommendedMaxLevel,
  type Difficulty,
  type LineupEntry,
  type Monster,
} from "@contracts/game";
import type { MonsterRow } from "@db/schema";
import { cn } from "@/lib/utils";

const DIFF_STYLE: Record<Difficulty, { label: string; cls: string }> = {
  trivial: { label: "Trivial", cls: "bg-slate-500/20 text-slate-300 border-slate-400/30" },
  easy: { label: "Easy", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  standard: { label: "Standard", cls: "bg-[rgba(240,192,64,0.15)] text-[var(--gold)] border-[rgba(240,192,64,0.35)]" },
  hard: { label: "Hard", cls: "bg-orange-500/15 text-orange-300 border-orange-400/30" },
  extreme: { label: "Extreme", cls: "bg-[rgba(214,60,42,0.2)] text-[var(--crimson-soft)] border-[rgba(214,60,42,0.45)]" },
};

const ROLES = ["Ambusher", "Artillery", "Brute", "Controller", "Defender", "Harrier", "Hexer", "Mount", "Support"] as const;

function toMonster(row: MonsterRow): Monster {
  return {
    id: row.id,
    name: row.name,
    group: row.groupName,
    keywords: row.keywords,
    level: row.level,
    organization: row.organization,
    role: (row.role as Monster["role"]) ?? null,
    ev: row.ev,
    stamina: row.stamina,
  };
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--line-soft)] text-[var(--paper)] hover:bg-[var(--ink-3)] disabled:opacity-30"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="font-num w-12 text-center text-3xl text-[var(--gold)]">{value}</div>
        <button
          className="flex h-11 w-11 items-center justify-center rounded border border-[var(--line-soft)] text-[var(--paper)] hover:bg-[var(--ink-3)] disabled:opacity-30"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {hint && <div className="mt-1 text-xs text-[var(--slate)]">{hint}</div>}
    </div>
  );
}

export default function Home() {
  const { data: monsterRows, isLoading: monstersLoading } = trpc.monsters.list.useQuery();
  const { data: stats } = trpc.encounters.stats.useQuery();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [searchParams] = useSearchParams();

  const [heroCount, setHeroCount] = useState(4);
  const [heroLevel, setHeroLevel] = useState(1);
  const [victories, setVictories] = useState(0);
  const [lineup, setLineup] = useState<LineupEntry[]>([]);
  const [encounterName, setEncounterName] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<"all" | "suggested" | number>("all");

  const monsters = useMemo(
    () => (monsterRows ?? []).map(toMonster),
    [monsterRows],
  );
  const monsterMap = useMemo(
    () => new Map(monsters.map((m) => [m.id, m])),
    [monsters],
  );

  // Load a shared encounter into the builder via /?e=<slug>
  const loadSlug = searchParams.get("e");
  const { data: loaded } = trpc.encounters.bySlug.useQuery(
    { slug: loadSlug! },
    { enabled: !!loadSlug, retry: false },
  );
  useEffect(() => {
    if (loaded) {
      setHeroCount(loaded.heroCount);
      setHeroLevel(loaded.heroLevel);
      setVictories(loaded.victories);
      setLineup(loaded.lineup);
      setEncounterName(loaded.name);
      toast.success(`Loaded "${loaded.name}"`);
    }
  }, [loaded]);

  const es = partyES(heroCount, heroLevel, victories);
  const hES = heroES(heroLevel);
  const totalEv = lineupTotalEv(lineup, monsterMap);
  const difficulty = classifyDifficulty(totalEv, heroCount, heroLevel, victories);
  const bands = difficultyBands(heroCount, heroLevel, victories);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monsters.filter((m) => {
      if (q && !(`${m.name} ${m.group} ${m.keywords.join(" ")}`.toLowerCase().includes(q)))
        return false;
      if (roleFilter && m.role !== roleFilter) return false;
      if (orgFilter && m.organization !== orgFilter) return false;
      if (levelFilter === "suggested") {
        if (m.level > recommendedMaxLevel(heroLevel, victories, m.organization)) return false;
      } else if (typeof levelFilter === "number" && m.level !== levelFilter) {
        return false;
      }
      return true;
    });
  }, [monsters, search, roleFilter, orgFilter, levelFilter, heroLevel, victories]);

  function addMonster(id: number) {
    const m = monsterMap.get(id);
    if (!m) return;
    setLineup((prev) => {
      const idx = prev.findIndex((e) => e.monsterId === id);
      const step = m.organization === "minion" ? 4 : 1;
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: Math.min(64, next[idx].count + step) };
        return next;
      }
      return [...prev, { monsterId: id, count: step }];
    });
  }

  function changeCount(id: number, delta: number) {
    const m = monsterMap.get(id);
    if (!m) return;
    const step = m.organization === "minion" ? 4 : 1;
    setLineup((prev) =>
      prev
        .map((e) =>
          e.monsterId === id ? { ...e, count: e.count + delta * step } : e,
        )
        .filter((e) => e.count > 0),
    );
  }

  function removeEntry(id: number) {
    setLineup((prev) => prev.filter((e) => e.monsterId !== id));
  }

  const createMutation = trpc.encounters.create.useMutation({
    onSuccess: async ({ slug }) => {
      const url = `${window.location.origin}/e/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Saved — share link copied to clipboard", { description: url });
      } catch {
        toast.success("Saved", { description: url });
      }
      utils.encounters.stats.invalidate();
      utils.encounters.listMine.invalidate();
    },
    onError: (err) => toast.error("Could not save encounter", { description: err.message }),
  });

  function save() {
    if (lineup.length === 0) {
      toast.error("Add at least one monster first");
      return;
    }
    createMutation.mutate({
      name: encounterName.trim() || "Untitled Encounter",
      heroCount,
      heroLevel,
      victories,
      lineup,
      totalEv,
      difficulty: difficulty ?? "custom",
    });
  }

  function exportJson() {
    if (lineup.length === 0) {
      toast.error("Add at least one monster first");
      return;
    }
    const payload = {
      name: encounterName.trim() || "Untitled Encounter",
      party: { heroes: heroCount, level: heroLevel, victories, encounterStrength: es },
      totalEV: totalEv,
      difficulty,
      monsters: lineup.map((e) => {
        const m = monsterMap.get(e.monsterId)!;
        return {
          name: m.name,
          level: m.level,
          organization: m.organization,
          role: m.role,
          count: e.count,
          ev: entryEv(m, e.count),
        };
      }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(encounterName.trim() || "draw-steel-encounter").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Budget bar scale: max mark = ES + 3×heroES (end of Hard), padded 20%
  const scaleMax = Math.max(es + 3 * hES, totalEv) * 1.15;
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100).toFixed(2)}%`;
  const barVars = {
    "--trivial-end": pct(Math.max(0, es - hES)),
    "--easy-end": pct(es),
    "--standard-end": pct(es + hES),
    "--hard-end": pct(es + 3 * hES),
  } as React.CSSProperties;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line-soft)]">
        <div className="ember-layer left-[-10%] top-[-30%] h-96 w-96 bg-[rgba(214,60,42,0.16)]" />
        <div className="ember-layer right-[-5%] top-[10%] h-80 w-80 bg-[rgba(240,192,64,0.08)]" style={{ animationDelay: "-6s" }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
          <p className="rise-in text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
            Free · No signup · Open data
          </p>
          <h1 className="rise-in rise-in-1 mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
            Draw Steel <span className="text-[var(--gold)]">Encounter Builder</span>
          </h1>
          <p className="rise-in rise-in-2 mt-5 max-w-2xl text-base leading-7 text-[var(--slate)] sm:text-lg">
            Build balanced encounters for your Draw Steel party in seconds.
            Pick monsters, set your heroes, and see the difficulty budget
            instantly — then export to JSON or share a link with your group.
          </p>
          <div className="rise-in rise-in-3 mt-6 flex flex-wrap items-center gap-6 text-sm text-[var(--slate)]">
            <div>
              <span className="font-num text-3xl text-[var(--paper)]">{monsters.length || "…"}</span>
              <span className="ml-2">official monsters</span>
            </div>
            <div>
              <span className="font-num text-3xl text-[var(--paper)]">{stats?.encountersBuilt ?? "…"}</span>
              <span className="ml-2">encounters built here</span>
            </div>
          </div>
        </div>
      </section>

      {/* Builder */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" id="builder">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Monster browser */}
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slate)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search monsters, keywords…"
                  className="h-11 w-full rounded border border-[var(--line-soft)] bg-[var(--ink-2)] pl-10 pr-3 text-sm text-[var(--paper)] placeholder:text-[var(--slate)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>
              <select
                value={orgFilter ?? ""}
                onChange={(e) => setOrgFilter(e.target.value || null)}
                className="h-11 rounded border border-[var(--line-soft)] bg-[var(--ink-2)] px-3 text-sm text-[var(--paper)]"
              >
                <option value="">All organizations</option>
                {ORGANIZATIONS.map((o) => (
                  <option key={o} value={o}>{ORG_LABEL[o]}</option>
                ))}
              </select>
              <select
                value={String(levelFilter)}
                onChange={(e) => {
                  const v = e.target.value;
                  setLevelFilter(v === "all" ? "all" : v === "suggested" ? "suggested" : Number(v));
                }}
                className="h-11 rounded border border-[var(--line-soft)] bg-[var(--ink-2)] px-3 text-sm text-[var(--paper)]"
              >
                <option value="all">All levels</option>
                <option value="suggested">Suggested for party</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(roleFilter === r ? null : r)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[44px]",
                    roleFilter === r
                      ? "border-[var(--gold)] bg-[rgba(240,192,64,0.15)] text-[var(--gold)]"
                      : "border-[var(--line-soft)] text-[var(--slate)] hover:text-[var(--paper)]",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {monstersLoading ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded bg-[var(--ink-2)]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-8 rounded border border-dashed border-[var(--line-soft)] p-10 text-center text-sm text-[var(--slate)]">
                No monsters match these filters. Try clearing the search or widening the level range.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addMonster(m.id)}
                    className="monster-card group p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display text-sm font-bold leading-snug">
                        {m.name}
                      </div>
                      <div className="font-num shrink-0 rounded-sm bg-[#0b1220] px-1.5 py-0.5 text-sm leading-none text-[var(--gold)]">
                        {m.ev}<span className="text-[9px] text-[var(--slate)]"> EV</span>
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-[#5a5348]">
                      Lv {m.level} {ORG_LABEL[m.organization]}{m.role ? ` ${m.role}` : ""}
                      {m.organization === "minion" && " · per 4"}
                    </div>
                    <div className="mt-2 border-t border-[rgba(11,18,32,0.15)] pt-2 text-[11px] text-[#5a5348]">
                      {m.keywords.join(" · ")}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#5a5348]">
                        STA {m.stamina}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--crimson)] text-white opacity-90 transition-transform group-hover:scale-110">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Party + budget panel */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-5">
              <h2 className="font-display text-lg font-bold">Your Party</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stepper label="Heroes" value={heroCount} onChange={setHeroCount} min={1} max={8} />
                <Stepper label="Level" value={heroLevel} onChange={setHeroLevel} min={1} max={10} />
                <Stepper label="Victories" value={victories} onChange={setVictories} min={0} max={30} hint="+1 ES hero per 2" />
              </div>

              <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
                    Encounter Strength
                  </span>
                  <span className="font-num text-2xl text-[var(--paper)]">{es}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--slate)]">
                  {heroCount} heroes × ES {hES}
                  {victories >= 2 && ` + ${Math.floor(victories / 2)} victory bonus`}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
                    Budget spent
                  </span>
                  <span className="font-num text-3xl text-[var(--gold)]">{totalEv} <span className="text-sm text-[var(--slate)]">EV</span></span>
                </div>
                <div className="budget-bar mt-2" style={barVars}>
                  {totalEv > 0 && (
                    <div
                      className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-white shadow"
                      style={{ left: pct(totalEv) }}
                    />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="text-slate-400">Trivial</span>
                    <span className="text-emerald-400">Easy</span>
                    <span className="text-[var(--gold)]">Standard</span>
                    <span className="text-orange-400">Hard</span>
                    <span className="text-[var(--crimson-soft)]">Extreme</span>
                  </div>
                </div>
                {difficulty && (
                  <div className={cn("mt-3 inline-block rounded border px-3 py-1 text-sm font-bold", DIFF_STYLE[difficulty].cls)}>
                    {DIFF_STYLE[difficulty].label} encounter
                  </div>
                )}
              </div>

              {/* Lineup */}
              <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">Lineup</h3>
                  {lineup.length > 0 && (
                    <button
                      onClick={() => setLineup([])}
                      className="text-xs text-[var(--slate)] hover:text-[var(--crimson-soft)]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {lineup.length === 0 ? (
                  <div className="mt-3 rounded border border-dashed border-[var(--line-soft)] p-4 text-center text-xs text-[var(--slate)]">
                    Click monster cards to add them to the encounter.
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {lineup.map((e) => {
                      const m = monsterMap.get(e.monsterId);
                      if (!m) return null;
                      const over = m.level > recommendedMaxLevel(heroLevel, victories, m.organization);
                      return (
                        <li
                          key={e.monsterId}
                          className={cn(
                            "flex items-center gap-2 rounded border border-[var(--line-soft)] bg-[var(--ink-3)] px-2.5 py-2",
                            over && "border-l-2 border-l-[var(--crimson)]",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
                              {over && <Skull className="h-3.5 w-3.5 shrink-0 text-[var(--crimson-soft)]" />}
                              <span className="truncate">{m.name}</span>
                            </div>
                            <div className="text-[11px] text-[var(--slate)]">
                              ×{e.count} · {entryEv(m, e.count)} EV
                              {over && " · above recommended level"}
                            </div>
                          </div>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded text-[var(--slate)] hover:bg-[var(--ink-2)] hover:text-[var(--paper)]"
                            onClick={() => changeCount(e.monsterId, -1)}
                            aria-label="Remove one"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded text-[var(--slate)] hover:bg-[var(--ink-2)] hover:text-[var(--paper)]"
                            onClick={() => changeCount(e.monsterId, 1)}
                            aria-label="Add one"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded text-[var(--slate)] hover:text-[var(--crimson-soft)]"
                            onClick={() => removeEntry(e.monsterId)}
                            aria-label="Remove from lineup"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                <input
                  value={encounterName}
                  onChange={(e) => setEncounterName(e.target.value)}
                  placeholder="Name this encounter…"
                  className="h-11 w-full rounded border border-[var(--line-soft)] bg-[var(--ink)] px-3 text-sm text-[var(--paper)] placeholder:text-[var(--slate)] focus:border-[var(--gold)] focus:outline-none"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={save}
                    disabled={createMutation.isPending}
                    className="flex h-11 items-center justify-center gap-2 rounded bg-[var(--crimson)] text-sm font-semibold text-white hover:bg-[var(--crimson-soft)] disabled:opacity-50"
                  >
                    {isAuthenticated ? <Save className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    {createMutation.isPending ? "Saving…" : isAuthenticated ? "Save & Share" : "Get share link"}
                  </button>
                  <button
                    onClick={exportJson}
                    className="flex h-11 items-center justify-center gap-2 rounded border border-[var(--line)] text-sm font-semibold text-[var(--gold)] hover:bg-[rgba(240,192,64,0.08)]"
                  >
                    <Download className="h-4 w-4" />
                    Export JSON
                  </button>
                </div>
                {!isAuthenticated && (
                  <p className="mt-2 text-[11px] leading-4 text-[var(--slate)]">
                    No account needed — anyone with the link can open it.{" "}
                    <Link to="/login" className="text-[var(--gold)] underline">Sign in</Link> to keep a
                    library of saved encounters.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--line-soft)] bg-[var(--ink-2)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            How the Draw Steel Encounter Builder Works
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <div className="font-num text-5xl text-[var(--crimson-soft)]">1</div>
              <h3 className="mt-2 font-display text-lg font-bold">Add your monsters</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
                Search or browse the monster list — each stat block shows level,
                role and keywords, straight from the Draw Steel rules. Minions
                are bought in squads of four, exactly as the rules intend.
              </p>
            </div>
            <div>
              <div className="font-num text-5xl text-[var(--crimson-soft)]">2</div>
              <h3 className="mt-2 font-display text-lg font-bold">Set your party</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
                Enter how many heroes are playing and their level. Earned
                Victories count too — every 2 Victories raise the party's
                encounter strength by one hero's worth.
              </p>
            </div>
            <div>
              <div className="font-num text-5xl text-[var(--crimson-soft)]">3</div>
              <h3 className="mt-2 font-display text-lg font-bold">Check the budget</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--slate)]">
                The builder totals your encounter value automatically and shows
                where it lands from Trivial to Extreme — then export as JSON or
                share a link with your group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty table */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Draw Steel Encounter Difficulty at a Glance
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--slate)]">
          Budgets update live from your party settings above. A hero's
          encounter strength is 4 + 2 × level; every 2 average Victories add
          one more hero's worth to the party.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--line-soft)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--line-soft)] bg-[var(--ink-2)] text-left">
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">Difficulty</th>
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">EV Budget</th>
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">Feel</th>
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">Victories</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => {
                const feel: Record<Difficulty, string> = {
                  trivial: "No real threat — the kobolds never stood a chance.",
                  easy: "Safe warm-up fight between respites.",
                  standard: "The bread-and-butter battle. Some Stamina lost.",
                  hard: "Climactic. Heroes must play smart to survive.",
                  extreme: "Deadly. Likely lethal below 8th level.",
                };
                return (
                  <tr
                    key={b.difficulty}
                    className={cn(
                      "border-b border-[var(--line-soft)] last:border-0",
                      difficulty === b.difficulty && "bg-[rgba(240,192,64,0.06)]",
                    )}
                  >
                    <td className="px-4 py-3 font-semibold">
                      <span className={cn("rounded border px-2 py-0.5 text-xs", DIFF_STYLE[b.difficulty].cls)}>
                        {b.label}
                      </span>
                      {difficulty === b.difficulty && (
                        <span className="ml-2 text-xs text-[var(--gold)]">← you are here</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-num text-lg">
                      {b.max === Infinity ? `${b.min}+` : `${b.min} – ${b.max}`}
                    </td>
                    <td className="px-4 py-3 text-[var(--slate)]">{feel[b.difficulty]}</td>
                    <td className="px-4 py-3">{b.victoriesAwarded}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-[var(--slate)]">
          Want the numbers for any party or a custom difficulty? Use the{" "}
          <Link to="/encounter-calculator" className="text-[var(--gold)] underline">
            Draw Steel encounter calculator
          </Link>
          .
        </p>
      </section>

      {/* Tools matrix */}
      <section className="border-t border-[var(--line-soft)] bg-[var(--ink-2)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">More Free Draw Steel Tools</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                to: "/encounter-calculator",
                title: "Encounter Calculator",
                desc: "Reverse the math: enter your party, get every difficulty budget and suggested monster mix.",
                anchor: "Draw Steel encounter calculator",
              },
              {
                to: "/foundry",
                title: "Foundry VTT",
                desc: "Set up Draw Steel in Foundry VTT and import your encounter JSON.",
                anchor: "Draw Steel Foundry module",
              },
              {
                to: "/vtt",
                title: "Battle Table",
                desc: "Run the fight right in your browser — grid, tokens, Malice and round tracking.",
                anchor: "Draw Steel VTT",
              },
              {
                to: "/dice",
                title: "Dice Roller",
                desc: "2d10 power rolls with edges and banes, tier results, plus the full polyhedral set.",
                anchor: "Draw Steel dice roller",
              },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group rounded-lg border border-[var(--line-soft)] bg-[var(--ink)] p-5 transition-colors hover:border-[var(--line)]"
              >
                <div className="font-display text-base font-bold group-hover:text-[var(--gold)]">
                  {t.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--slate)]">{t.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-[var(--crimson-soft)]">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "What is a Draw Steel encounter?",
              a: "A Draw Steel encounter is a combat scene built from a budget of monsters, meant to challenge a party of heroes of a given level. The Director spends encounter value (EV) on creatures whose total matches the party's encounter strength for the difficulty they want.",
            },
            {
              q: "How does encounter budgeting work in Draw Steel?",
              a: "Each hero is worth 4 + 2 × their level in encounter strength. A standard encounter spends about the party's total encounter strength on monsters; easy encounters spend less, hard encounters up to three extra heroes' worth. Every 2 average Victories the party has earned add one more hero's worth to the budget.",
            },
            {
              q: "Which monsters are included?",
              a: "The builder ships with creatures from the official Draw Steel Monsters book — demons across all four echelons, basilisks, bugbears, devils, draconians, animals and solo threats like the ashen hoarder, bredbeddle and chimera. More are added regularly.",
            },
            {
              q: "Can I save or share my encounters?",
              a: "Yes. Export any encounter as JSON, or generate a share link that recreates the exact same encounter for your group. Sign in to keep a personal library of saved encounters across devices.",
            },
            {
              q: "Is the Draw Steel Encounter Builder free?",
              a: "Yes — free to use, no signup and no paywall. The tools run in your browser and the rules data is published under the DRAW STEEL Creator License.",
            },
            {
              q: "Is this site affiliated with MCDM?",
              a: "No. Draw Steel Tools is an independent fan project published under the DRAW STEEL Creator License, and is not affiliated with MCDM Productions, LLC.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] px-5 py-4 open:border-[var(--line)]"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold leading-6 min-h-[44px] flex items-center justify-between">
                {f.q}
                <span className="ml-4 text-[var(--gold)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-2 pt-1 text-sm leading-6 text-[var(--slate)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  );
}
