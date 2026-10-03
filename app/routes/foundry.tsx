import type { Route } from "./+types/foundry";
import FoundryPage from "@/pages/Foundry";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Draw Steel on Foundry VTT – Setup, Modules & Compendiums" },
    {
      name: "description",
      content:
        "How to run Draw Steel on Foundry VTT: the official system, useful modules, and how to import encounters built with the free Draw Steel encounter builder.",
    },
  ];
}

export default function FoundryRoute() {
  return <FoundryPage />;
}
