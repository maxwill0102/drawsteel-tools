import { Link, useNavigate, useParams } from "react-router";
import { Swords, Table2 } from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import {
  difficultyBands,
  entryEv,
  ORG_LABEL,
  partyES,
  type Monster,
} from "@contracts/game";
import { cn } from "@/lib/utils";

const DIFF_BADGE: Record<string, string> = {
  trivial: "text-slate-300 border-slate-400/30 bg-slate-500/10",
  easy: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  standard: "text-[var(--gold)] border-[rgba(240,192,64,0.35)] bg-[rgba(240,192,64,0.1)]",
  hard: "text-orange-300 border-orange-400/30 bg-orange-500/10",
  extreme: "text-[var(--crimson-soft)] border-[rgba(214,60,42,0.45)] bg-[rgba(214,60,42,0.12)]",
};

export default function SharedEncounter() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: encounter, isLoading, error } = trpc.encounters.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug, retry: false },
  );
  const { data: monsterRows } = trpc.monsters.list.useQuery();

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-[var(--slate)]">Loading encounter…</div>
      </Layout>
    );
  }

  if (error || !encounter) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Encounter not found</h1>
          <p className="mt-3 text-sm text-[var(--slate)]">
            This link may be broken or the encounter was deleted.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-[var(--gold)] underline">
            Build your own encounter
          </Link>
        </div>
      </Layout>
    );
  }

  const monsterMap = new Map<number, Monster>(
    (monsterRows ?? []).map((r) => [
      r.id,
      {
        id: r.id,
        name: r.name,
        group: r.groupName,
        keywords: r.keywords,
        level: r.level,
        organization: r.organization,
        role: (r.role as Monster["role"]) ?? null,
        ev: r.ev,
        stamina: r.stamina,
      },
    ]),
  );

  const es = partyES(encounter.heroCount, encounter.heroLevel, encounter.victories);
  const band = difficultyBands(encounter.heroCount, encounter.heroLevel, encounter.victories).find(
    (b) => b.difficulty === encounter.difficulty,
  );

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--crimson-soft)]">
          Shared encounter
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
            {encounter.name}
          </h1>
          <span
            className={cn(
              "rounded border px-3 py-1 text-sm font-bold uppercase tracking-wider",
              DIFF_BADGE[encounter.difficulty] ?? "text-[var(--slate)] border-[var(--line-soft)]",
            )}
          >
            {encounter.difficulty}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Heroes", value: `${encounter.heroCount} · Lv ${encounter.heroLevel}` },
            { label: "Victories", value: String(encounter.victories) },
            { label: "Party ES", value: String(es) },
            { label: "Total EV", value: String(encounter.totalEv) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slate)]">
                {s.label}
              </div>
              <div className="font-num mt-1 text-2xl text-[var(--gold)]">{s.value}</div>
            </div>
          ))}
        </div>

        {band && (
          <p className="mt-4 text-sm text-[var(--slate)]">
            {band.label} budget for this party: {band.max === Infinity ? `${band.min}+` : `${band.min} – ${band.max}`} EV · worth {band.victoriesAwarded} {band.victoriesAwarded === "1" ? "Victory" : "Victories"} on success.
          </p>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line-soft)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line-soft)] bg-[var(--ink-2)] text-left">
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">Monster</th>
                <th className="px-4 py-3 font-semibold text-[var(--gold)]">Type</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--gold)]">Count</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--gold)]">EV</th>
              </tr>
            </thead>
            <tbody>
              {encounter.lineup.map((e) => {
                const m = monsterMap.get(e.monsterId);
                if (!m) return null;
                return (
                  <tr key={e.monsterId} className="border-b border-[var(--line-soft)] last:border-0">
                    <td className="px-4 py-3 font-semibold">{m.name}</td>
                    <td className="px-4 py-3 text-[var(--slate)]">
                      Lv {m.level} {ORG_LABEL[m.organization]}{m.role ? ` ${m.role}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right">×{e.count}</td>
                    <td className="px-4 py-3 text-right font-num text-lg">{entryEv(m, e.count)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/?e=${encounter.slug}`)}
            className="flex h-11 items-center gap-2 rounded bg-[var(--crimson)] px-5 text-sm font-semibold text-white hover:bg-[var(--crimson-soft)]"
          >
            <Swords className="h-4 w-4" /> Open in builder
          </button>
          <button
            onClick={() => navigate(`/vtt?e=${encounter.slug}`)}
            className="flex h-11 items-center gap-2 rounded border border-[var(--line)] px-5 text-sm font-semibold text-[var(--gold)] hover:bg-[rgba(240,192,64,0.08)]"
          >
            <Table2 className="h-4 w-4" /> Deploy to battle table
          </button>
        </div>
      </section>
    </Layout>
  );
}
