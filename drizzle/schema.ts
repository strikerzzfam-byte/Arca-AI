import { pgTable, foreignKey, serial, integer, varchar, boolean, text, date, unique, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const status = pgEnum("status", ['archived', 'private', 'public'])


export const experience = pgTable("experience", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id"),
	title: varchar({ length: 255 }),
	companyName: varchar("company_name", { length: 255 }),
	city: varchar({ length: 255 }),
	state: varchar({ length: 255 }),
	currentlyWorking: boolean("currently_working").default(false).notNull(),
	workSummary: text("work_summary"),
	startDate: date("start_date"),
	endDate: date("end_date"),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.id],
			name: "experience_document_id_document_id_fk"
		}).onDelete("cascade"),
]);

export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	name: varchar({ length: 255 }),
	rating: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.id],
			name: "skills_document_id_document_id_fk"
		}).onDelete("cascade"),
]);

export const document = pgTable("document", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id").notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	summary: text(),
	themeColor: varchar("theme_color", { length: 255 }).default('#7c3aed').notNull(),
	thumbnail: text(),
	currentPosition: integer("current_position").default(1).notNull(),
	status: status().default('private').notNull(),
	authorName: varchar("author_name", { length: 255 }).notNull(),
	authorEmail: varchar("author_email", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("document_document_id_unique").on(table.documentId),
]);

export const education = pgTable("education", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	universityName: varchar("university_name", { length: 255 }),
	degree: varchar({ length: 255 }),
	major: varchar({ length: 255 }),
	description: text(),
	startDate: date("start_date"),
	endDate: date("end_date"),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.id],
			name: "education_document_id_document_id_fk"
		}).onDelete("cascade"),
]);

export const personalInfo = pgTable("personal_info", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id"),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	jobTitle: varchar("job_title", { length: 255 }),
	address: varchar({ length: 500 }),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.id],
			name: "personal_info_document_id_document_id_fk"
		}).onDelete("cascade"),
]);

export const chats = pgTable("chats", {
	id: serial().primaryKey().notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const frames = pgTable("frames", {
	id: serial().primaryKey().notNull(),
	designCode: text("design_code").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
