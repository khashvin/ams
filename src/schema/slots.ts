import { text, integer, sqliteTable, } from "drizzle-orm/sqlite-core";

export const slots = sqliteTable('slots', {
  id: integer('id').primaryKey(),
  dateTime: text('date_time').notNull().unique(),
  availableSlots: integer('available_slots').notNull().default(1),
});

export type Slot = typeof slots.$inferSelect;
export type NewSlot = typeof slots.$inferInsert;