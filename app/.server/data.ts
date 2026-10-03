import { asc, eq } from "drizzle-orm";
import { getDb } from "../../server/queries/connection";
import { encounters, monsters } from "../../db/schema";

/** Server-only data access for route loaders (never shipped to the browser). */

export async function getMonsters() {
  const db = getDb();
  return db.select().from(monsters).orderBy(asc(monsters.level), asc(monsters.name));
}

export async function getEncounterBySlug(slug: string) {
  const db = getDb();
  return db.query.encounters.findFirst({ where: eq(encounters.slug, slug) });
}

export async function getEncountersStats() {
  const db = getDb();
  const rows = await db.select({ id: encounters.id }).from(encounters);
  return { encountersBuilt: rows.length };
}
