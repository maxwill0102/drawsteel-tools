import type { Route } from "./+types/my-encounters";
import MyEncountersPage from "@/pages/MyEncounters";
import { canonical } from "../seo";

export function meta(_: Route.MetaArgs) {
  return [
{ title: "My Encounters – Draw Steel Tools" },
    { name: "robots", content: "noindex" },
    { tagName: "link", rel: "canonical", href: canonical("/encounters") },
  ];
}

export default function MyEncountersRoute() {
  return <MyEncountersPage />;
}
