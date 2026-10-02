import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { ExternalLink, Pencil, Trash2, Swords } from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const DIFF_BADGE: Record<string, string> = {
  trivial: "text-slate-300 border-slate-400/30",
  easy: "text-emerald-300 border-emerald-400/30",
  standard: "text-[var(--gold)] border-[rgba(240,192,64,0.35)]",
  hard: "text-orange-300 border-orange-400/30",
  extreme: "text-[var(--crimson-soft)] border-[rgba(214,60,42,0.45)]",
  custom: "text-[var(--slate)] border-[var(--line-soft)]",
};

export default function MyEncounters() {
  const { isAuthenticated, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const { data: encounters, isLoading: listLoading } = trpc.encounters.listMine.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const removeMutation = trpc.encounters.remove.useMutation({
    onSuccess: () => {
      toast.success("Encounter deleted");
      utils.encounters.listMine.invalidate();
      utils.encounters.stats.invalidate();
    },
    onError: (e) => toast.error("Delete failed", { description: e.message }),
  });

  const renameMutation = trpc.encounters.update.useMutation({
    onSuccess: () => {
      toast.success("Renamed");
      utils.encounters.listMine.invalidate();
    },
    onError: (e) => toast.error("Rename failed", { description: e.message }),
  });

  if (isLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-[var(--slate)]">
          Loading…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">My Encounters</h1>
            <p className="mt-2 text-sm text-[var(--slate)]">
              Saved to your account — open, rename, share or deploy to the battle table.
            </p>
          </div>
          <Link
            to="/"
            className="flex h-11 items-center gap-2 rounded bg-[var(--crimson)] px-5 text-sm font-semibold text-white hover:bg-[var(--crimson-soft)]"
          >
            <Swords className="h-4 w-4" /> New encounter
          </Link>
        </div>

        {listLoading ? (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--ink-2)]" />
            ))}
          </div>
        ) : !encounters || encounters.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-[var(--line-soft)] p-14 text-center">
            <Swords className="mx-auto h-8 w-8 text-[var(--slate)]" />
            <p className="mt-4 text-sm text-[var(--slate)]">
              No saved encounters yet. Build one and hit "Save &amp; Share".
            </p>
            <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[var(--gold)] underline">
              Open the encounter builder
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {encounters.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--line-soft)] bg-[var(--ink-2)] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-display text-base font-bold">{e.name}</span>
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        DIFF_BADGE[e.difficulty] ?? DIFF_BADGE.custom,
                      )}
                    >
                      {e.difficulty}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--slate)]">
                    {e.heroCount} heroes · level {e.heroLevel} · {e.totalEv} EV · updated{" "}
                    {new Date(e.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/e/${e.slug}`}
                    className="flex h-11 items-center gap-1.5 rounded border border-[var(--line-soft)] px-3 text-xs font-semibold text-[var(--gold)] hover:bg-[rgba(240,192,64,0.08)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Share page
                  </Link>
                  <button
                    onClick={() => navigate(`/?e=${e.slug}`)}
                    className="flex h-11 items-center gap-1.5 rounded border border-[var(--line-soft)] px-3 text-xs font-semibold hover:bg-[var(--ink-3)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const name = window.prompt("Rename encounter", e.name);
                      if (!name?.trim() || name.trim() === e.name) return;
                      renameMutation.mutate({
                        id: e.id,
                        name: name.trim(),
                        heroCount: e.heroCount,
                        heroLevel: e.heroLevel,
                        victories: e.victories,
                        lineup: e.lineup,
                        totalEv: e.totalEv,
                        difficulty: e.difficulty,
                      });
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded text-[var(--slate)] hover:bg-[var(--ink-3)] hover:text-[var(--paper)]"
                    aria-label="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${e.name}"? This cannot be undone.`))
                        removeMutation.mutate({ id: e.id });
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded text-[var(--slate)] hover:text-[var(--crimson-soft)]"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
