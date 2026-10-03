import type { Route } from "./+types/login";
import LoginPage from "@/pages/Login";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sign in – Draw Steel Tools" },
    { name: "robots", content: "noindex" },
  ];
}

export default function LoginRoute() {
  return <LoginPage />;
}
