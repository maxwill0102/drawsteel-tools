import { authRouter } from "./auth-router";
import { monstersRouter } from "./monsters-router";
import { encountersRouter } from "./encounters-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  monsters: monstersRouter,
  encounters: encountersRouter,
});

export type AppRouter = typeof appRouter;
