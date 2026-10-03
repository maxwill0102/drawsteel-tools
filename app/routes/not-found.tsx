import type { Route } from "./+types/not-found";
import NotFoundPage from "@/pages/NotFound";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Page not found – Draw Steel Tools" },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
