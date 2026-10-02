import { relations } from "drizzle-orm";
import { users, encounters } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  encounters: many(encounters),
}));

export const encountersRelations = relations(encounters, ({ one }) => ({
  user: one(users, {
    fields: [encounters.userId],
    references: [users.id],
  }),
}));
