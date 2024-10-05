import { text, integer, sqliteTable, } from "drizzle-orm/sqlite-core";
import * as slots from './slots';
import * as users from './users';

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey(),
  dateTime: text('date_time').notNull(),
  slot: integer('slot').references(() => slots.slots.id).unique(),
  user: integer('user').references(() => users.users.id).unique(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;