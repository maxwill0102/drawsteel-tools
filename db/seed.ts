import { getDb } from "../server/queries/connection";
import { monsters } from "./schema";
import { MONSTER_SEED } from "./monsters-data";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existing = await db.select({ id: monsters.id }).from(monsters).limit(1);
  if (existing.length > 0) {
    console.log("Monsters already seeded, skipping.");
    process.exit(0);
  }

  await db.insert(monsters).values(MONSTER_SEED);
  console.log(`Seeded ${MONSTER_SEED.length} monsters.`);
  process.exit(0);
}

seed();
