import type { Route } from "./+types/shared-encounter";
import { isRouteErrorResponse, Link } from "react-router";
import SharedEncounterPage from "@/pages/SharedEncounter";
import { getEncounterBySlug, getMonsters } from "../.server/data";
import { pageMeta } from "../seo";

export async function loader({ params }: Route.LoaderArgs) {
  const encounter = await getEncounterBySlug(params.slug ?? "");
  if (!encounter) {
    throw new Response("Encounter not found", { status: 404 });
  }
  const monsters = await getMonsters();
  return { encounter, monsters };
}

export function meta({ data, params }: Route.MetaArgs) {
  if (!data) {
    return [
      { title: "Encounter not found – Draw Steel Tools" },
      { name: "robots", content: "noindex" },
    ];
  }
  const e = data.encounter;
  return pageMeta({
    title: `${e.name} – Shared Draw Steel Encounter`,
    description: `${e.name}: a ${e.difficulty} Draw Steel encounter for ${e.heroCount} level ${e.heroLevel} heroes (EV ${e.totalEv}). Open it in the free encounter builder.`,
    path: `/e/${params.slug}`,
  });
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-num text-6xl text-[var(--gold)]">404</p>
        <h1 className="font-display mt-4 text-xl font-bold text-[var(--paper)]">
          Encounter not found
        </h1>
        <p className="mt-2 text-sm text-[var(--slate)]">
          This share link is invalid or the encounter was deleted.
        </p>
        <Link
          to="/"
          className="mt-6 rounded bg-[var(--crimson)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Build a new encounter
        </Link>
      </div>
    );
  }
  throw error;
}

export default function SharedEncounterRoute({
  loaderData,
}: Route.ComponentProps) {
  return <SharedEncounterPage loaderData={loaderData} />;
}
