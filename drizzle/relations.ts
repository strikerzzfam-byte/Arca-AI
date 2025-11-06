import { relations } from "drizzle-orm/relations";
import { document, experience, skills, education, personalInfo } from "./schema";

export const experienceRelations = relations(experience, ({one}) => ({
	document: one(document, {
		fields: [experience.documentId],
		references: [document.id]
	}),
}));

export const documentRelations = relations(document, ({many}) => ({
	experiences: many(experience),
	skills: many(skills),
	educations: many(education),
	personalInfos: many(personalInfo),
}));

export const skillsRelations = relations(skills, ({one}) => ({
	document: one(document, {
		fields: [skills.documentId],
		references: [document.id]
	}),
}));

export const educationRelations = relations(education, ({one}) => ({
	document: one(document, {
		fields: [education.documentId],
		references: [document.id]
	}),
}));

export const personalInfoRelations = relations(personalInfo, ({one}) => ({
	document: one(document, {
		fields: [personalInfo.documentId],
		references: [document.id]
	}),
}));