import type { Route } from "./+types/home";
import HomePage from "@/pages/Home";
import {
  getEncounterBySlug,
  getEncountersStats,
  getMonsters,
} from "../.server/data";
import { jsonLd, pageMeta, SITE_URL } from "../seo";

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

const HOME_FAQ = [
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
];

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "Draw Steel Encounter Builder – Free & Balanced Encounters",
      description:
        "Build balanced Draw Steel encounters in seconds. Pick monsters, check the difficulty budget automatically, export to JSON or share a link. Free, no signup.",
      path: "/",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Draw Steel Encounter Builder",
      url: `${SITE_URL}/`,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free Draw Steel encounter builder: pick monsters, set your party, and see the EV difficulty budget instantly. Export JSON or share a link.",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  ];
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}
