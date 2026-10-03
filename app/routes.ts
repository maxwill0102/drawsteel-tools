import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("encounter-calculator", "routes/calculator.tsx"),
  route("foundry", "routes/foundry.tsx"),
  route("vtt", "routes/vtt.tsx"),
  route("dice", "routes/dice.tsx"),
  route("encounters", "routes/my-encounters.tsx"),
  route("e/:slug", "routes/shared-encounter.tsx"),
  route("login", "routes/login.tsx"),
  // API (tRPC + OAuth callback) lives in the same serverless function
  route("api/trpc/*", "routes/api-trpc.ts"),
  route("api/oauth/callback", "routes/api-oauth.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
