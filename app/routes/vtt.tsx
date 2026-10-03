import type { Route } from "./+types/vtt";
import VttPage from "@/pages/Vtt";
import { getEncounterBySlug, getMonsters } from "../.server/data";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sharedSlug = url.searchParams.get("e");
  const monsters = await getMonsters();
  let shared = null;
  if (sharedSlug && sharedSlug.length >= 4 && sharedSlug.length <= 16) {
    shared = (await getEncounterBySlug(sharedSlug)) ?? null;
  }
  return { monsters, shared };
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Draw Steel Battle Table – Tokens, Malice & Round Tracker" },
    {
      name: "description",
      content:
        "A free virtual battle table for Draw Steel: drop monster tokens on the grid, track Malice and rounds, and load any shared encounter by link.",
    },
  ];
}

export default function VttRoute({ loaderData }: Route.ComponentProps) {
  return <VttPage loaderData={loaderData} />;
}
