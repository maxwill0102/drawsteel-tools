import type { Route } from "./+types/vtt";
import VttPage from "@/pages/Vtt";
import { getEncounterBySlug, getMonsters } from "../.server/data";
import { jsonLd, pageMeta } from "../seo";

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

const VTT_FAQ = [
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
];

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "Draw Steel VTT – Free Battle Table with Tokens & Malice Tracker",
      description:
        "A free Draw Steel VTT battle table: drop monster tokens on the grid, track Malice and rounds by the official rules, and load any shared encounter by link. No signup, runs in your browser.",
      path: "/vtt",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: VTT_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  ];
}

export default function VttRoute({ loaderData }: Route.ComponentProps) {
  return <VttPage loaderData={loaderData} />;
}
