import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
} from "drizzle-orm/mysql-core";
import type { LineupEntry } from "@contracts/game";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const monsters = mysqlTable("monsters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  groupName: varchar("groupName", { length: 255 }).notNull(),
  keywords: json("keywords").$type<string[]>().notNull(),
  level: int("level").notNull(),
  organization: mysqlEnum("organization", [
    "minion",
    "horde",
    "platoon",
    "elite",
    "leader",
    "solo",
  ]).notNull(),
  role: varchar("role", { length: 32 }),
  ev: int("ev").notNull(),
  stamina: int("stamina").notNull(),
});

export type MonsterRow = typeof monsters.$inferSelect;

export const encounters = mysqlTable("encounters", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 16 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  heroCount: int("heroCount").notNull(),
  heroLevel: int("heroLevel").notNull(),
  victories: int("victories").notNull().default(0),
  lineup: json("lineup").$type<LineupEntry[]>().notNull(),
  totalEv: int("totalEv").notNull(),
  difficulty: varchar("difficulty", { length: 16 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type EncounterRow = typeof encounters.$inferSelect;
