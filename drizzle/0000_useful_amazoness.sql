CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "frames" (
	"id" serial PRIMARY KEY NOT NULL,
	"design_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
