import type { Route } from "./+types/dice";
import DicePage from "@/pages/Dice";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Draw Steel Dice Roller – 2d10 Power Rolls Online" },
    {
      name: "description",
      content:
        "Roll Draw Steel power rolls online: 2d10 with edges and banes, automatic tier results, plus quick rolls for any die size. Free, no signup.",
    },
  ];
}

export default function DiceRoute() {
  return <DicePage />;
}
