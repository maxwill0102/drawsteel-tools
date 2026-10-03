import type { Route } from "./+types/calculator";
import CalculatorPage from "@/pages/Calculator";
import { pageMeta } from "../seo";

export function meta(_: Route.MetaArgs) {
  return pageMeta({
    title: "Draw Steel Encounter Calculator – EV Budgets & Difficulty",
    description:
      "Compute Draw Steel encounter budgets for any party: encounter strength, EV spending bands from Trivial to Extreme, and recommended monster levels.",
    path: "/encounter-calculator",
  });
}

export default function CalculatorRoute() {
  return <CalculatorPage />;
}
