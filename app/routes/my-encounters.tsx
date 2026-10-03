import type { Route } from "./+types/my-encounters";
import MyEncountersPage from "@/pages/MyEncounters";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "My Encounters – Draw Steel Tools" },
    { name: "robots", content: "noindex" },
  ];
}

export default function MyEncountersRoute() {
  return <MyEncountersPage />;
}
