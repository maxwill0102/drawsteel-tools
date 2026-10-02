import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { encounters } from "../db/schema";
import { SHARE_SLUG_ALPHABET, type LineupEntry } from "../contracts/game";

const lineupSchema = z
  .array(
    z.object({
      monsterId: z.number().int().positive(),
      count: z.number().int().min(1).max(64),
    }),
  )
  .max(32);

const encounterInput = z.object({
  name: z.string().min(1).max(255),
  heroCount: z.number().int().min(1).max(10),
  heroLevel: z.number().int().min(1).max(10),
  victories: z.number().int().min(0).max(30),
  lineup: lineupSchema,
  totalEv: z.number().int().min(0),
  difficulty: z.string().max(16),
});

function randomSlug(len = 8): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += SHARE_SLUG_ALPHABET[Math.floor(Math.random() * SHARE_SLUG_ALPHABET.length)];
  }
  return s;
}

export const encountersRouter = createRouter({
  /** Create an encounter. Works anonymously (share link); attaches to user when signed in. */
  create: publicQuery.input(encounterInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const slug = randomSlug();
    await db.insert(encounters).values({
      slug,
      name: input.name,
      userId: ctx.user?.id ?? null,
      heroCount: input.heroCount,
      heroLevel: input.heroLevel,
      victories: input.victories,
      lineup: input.lineup,
      totalEv: input.totalEv,
      difficulty: input.difficulty,
    });
    return { slug };
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string().min(4).max(16) }))
    .query(async ({ input }) => {
      const db = getDb();
      const row = await db.query.encounters.findFirst({
        where: eq(encounters.slug, input.slug),
      });
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Encounter not found" });
      return row;
    }),

  listMine: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.encounters.findMany({
      where: eq(encounters.userId, ctx.user.id),
      orderBy: [desc(encounters.updatedAt)],
    });
  }),

  update: authedQuery
    .input(encounterInput.extend({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.encounters.findFirst({
        where: and(eq(encounters.id, input.id), eq(encounters.userId, ctx.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Encounter not found" });
      await db
        .update(encounters)
        .set({
          name: input.name,
          heroCount: input.heroCount,
          heroLevel: input.heroLevel,
          victories: input.victories,
          lineup: input.lineup satisfies LineupEntry[],
          totalEv: input.totalEv,
          difficulty: input.difficulty,
        })
        .where(eq(encounters.id, input.id));
      return { slug: existing.slug };
    }),

  remove: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.encounters.findFirst({
        where: and(eq(encounters.id, input.id), eq(encounters.userId, ctx.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Encounter not found" });
      await db.delete(encounters).where(eq(encounters.id, input.id));
      return { ok: true };
    }),

  /** Public count for the landing page social proof. */
  stats: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({ id: encounters.id }).from(encounters);
    return { encountersBuilt: rows.length };
  }),
});
