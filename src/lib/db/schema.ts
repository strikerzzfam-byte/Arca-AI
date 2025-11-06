import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const frames = pgTable('frames', {
  id: serial('id').primaryKey(),
  designCode: text('design_code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type Frame = typeof frames.$inferSelect;