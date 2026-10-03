import type { Route } from "./+types/dice";
import DicePage from "@/pages/Dice";
import { jsonLd, pageMeta } from "../seo";

const DICE_FAQ = [
  {
    q: "What dice do you need to play Draw Steel?",
    a: "Draw Steel uses two ten-sided dice (2d10) for power rolls — the core test mechanic for attacks, tests and resistances. No other dice are required, which is why a 2d10 roller covers nearly every roll at the table.",
  },
  {
    q: "How do power roll tiers work in Draw Steel?",
    a: "Roll 2d10 and add your characteristic and any bonuses. A total of 11 or lower is a tier 1 outcome, 12–16 is tier 2, and 17 or higher is tier 3. Higher tiers mean stronger effects — abilities list exactly what each tier does.",
  },
  {
    q: "How do edges and banes work in Draw Steel?",
    a: "Each edge on a roll adds +2 to the total, and each bane subtracts 2. Edges and banes cancel each other out. Two or more edges can turn a likely tier 2 result into a tier 3 — the roller above applies them automatically.",
  },
  {
    q: "Does this Draw Steel dice roller work on phones?",
    a: "Yes. The roller is a web page, not an app — it works in any mobile browser, keeps a history of your last 30 rolls, and needs no account or download.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...pageMeta({
      title: "Draw Steel Dice Roller – 2d10 Power Rolls with Edges & Banes",
      description:
        "Roll Draw Steel power rolls online: 2d10 with edges and banes applied automatically, instant tier results (≤11 / 12–16 / 17+), plus quick polyhedral dice. Free, no signup.",
      path: "/dice",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: DICE_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  ];
}

export default function DiceRoute() {
  return <DicePage />;
}
