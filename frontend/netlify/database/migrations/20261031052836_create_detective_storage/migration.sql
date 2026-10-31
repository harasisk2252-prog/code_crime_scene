CREATE TABLE "demo_users" (
	"email" text PRIMARY KEY,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "detective_progress" (
	"key" text PRIMARY KEY,
	"progress" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
