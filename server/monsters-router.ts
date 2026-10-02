import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { monsters } from "../db/schema";
import { asc } from "drizzle-orm";

export const monstersRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(monsters)
      .orderBy(asc(monsters.level), asc(monsters.name));
    return rows;
  }),
});
