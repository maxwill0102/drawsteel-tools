import type { Route } from "./+types/calculator";
import CalculatorPage from "@/pages/Calculator";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Draw Steel Encounter Calculator – EV Budgets & Difficulty" },
    {
      name: "description",
      content:
        "Compute Draw Steel encounter budgets for any party: encounter strength, EV spending bands from Trivial to Extreme, and recommended monster levels.",
    },
  ];
}

export default function CalculatorRoute() {
  return <CalculatorPage />;
}
