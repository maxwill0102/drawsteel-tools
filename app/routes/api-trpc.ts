import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Route } from "./+types/api-trpc";
import { appRouter } from "../../server/router";
import { createContext } from "../../server/context";

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
  });

export const loader = ({ request }: Route.LoaderArgs) => handler(request);
export const action = ({ request }: Route.ActionArgs) => handler(request);
