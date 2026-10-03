import type { Route } from "./+types/home";
import HomePage from "@/pages/Home";
import {
  getEncounterBySlug,
  getEncountersStats,
  getMonsters,
} from "../.server/data";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sharedSlug = url.searchParams.get("e");
  const [monsters, stats] = await Promise.all([
    getMonsters(),
    getEncountersStats(),
  ]);
  let shared = null;
  if (sharedSlug && sharedSlug.length >= 4 && sharedSlug.length <= 16) {
    shared = (await getEncounterBySlug(sharedSlug)) ?? null;
  }
  return { monsters, stats, shared };
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Draw Steel Encounter Builder – Free & Balanced Encounters" },
    {
      name: "description",
      content:
        "Build balanced Draw Steel encounters in seconds. Pick monsters, check the difficulty budget automatically, export to JSON or share a link. Free, no signup.",
    },
  ];
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}
