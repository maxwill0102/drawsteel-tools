import type { Route } from "./+types/foundry";
import FoundryPage from "@/pages/Foundry";
import { jsonLd, pageMeta } from "../seo";

const HOWTO_STEPS = [
  {
    name: "Install a Draw Steel system or module",
    text: "In Foundry VTT, open Add-on Modules → Install Module and search for a Draw Steel community module, or paste a manifest URL from the community. The Draw Steel community maintains data packs covering monsters and rules released under the Creator License.",
  },
  {
    name: "Import your encounter JSON",
    text: "Build your encounter in the Draw Steel encounter builder, hit Export JSON, and hand it to your module's importer (or keep it open as a reference card during play). Names, counts, levels and EV totals transfer directly.",
  },
  {
    name: "Place tokens and set the scene",
    text: "Drop your monsters on a scene with cover and elevation — Draw Steel battles shine with vertical maps, ledges and dynamic terrain objects. Budget one or two terrain objects into standard fights, two or three into hard ones.",
  },
  {
    name: "Track Malice at the table",
    text: "At the start of each round you gain Malice equal to the number of heroes plus the round number. Use the battle table on this site alongside Foundry if you want a fast shared reference for Malice and initiative groups.",
  },
];

const FOUNDRY_FAQ = [
  {
    q: "Is there an official Draw Steel Foundry module?",
    a: "MCDM and the community publish Draw Steel support for virtual tabletops under the Creator License. Check Foundry's module browser and the official Draw Steel Discord for the current community modules — the ecosystem moves fast.",
  },
  {
    q: "Can I use the monster data from this site in Foundry?",
    a: "Yes. Every encounter you build here exports as clean JSON with names, levels, organizations, roles, EV and Stamina — the fields a Foundry importer or journal reference needs.",
  },
  {
    q: "Do I need Foundry to play Draw Steel online?",
    a: "No. For lightweight sessions you can run the whole fight in your browser with the battle table on this site — tokens, grid, Malice and round tracking included.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "Draw Steel on Foundry VTT – Setup, Modules & Compendiums",
      description:
        "How to run Draw Steel on Foundry VTT: the official system, useful modules, and how to import encounters built with the free Draw Steel encounter builder.",
      path: "/foundry",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to run Draw Steel encounters on Foundry VTT",
      description:
        "Set up Draw Steel content in Foundry VTT and import encounters built with the free Draw Steel encounter builder.",
      step: HOWTO_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FOUNDRY_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  ];
}

export default function FoundryRoute() {
  return <FoundryPage />;
}
