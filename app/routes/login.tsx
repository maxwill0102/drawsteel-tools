import type { Route } from "./+types/login";
import LoginPage from "@/pages/Login";
import { canonical } from "../seo";

export function meta(_: Route.MetaArgs) {
  return [
{ title: "Sign in – Draw Steel Tools" },
    { name: "robots", content: "noindex" },
    { tagName: "link", rel: "canonical", href: canonical("/login") },
  ];
}

export default function LoginRoute() {
  return <LoginPage />;
}
