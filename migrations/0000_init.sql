CREATE SCHEMA "rpg";
--> statement-breakpoint
CREATE TABLE "rpg"."accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"password_hash" text NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "accounts_name_key_unique" UNIQUE("name_key")
);
--> statement-breakpoint
CREATE TABLE "rpg"."characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"save" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "characters_name_key_unique" UNIQUE("name_key")
);
--> statement-breakpoint
CREATE TABLE "rpg"."config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rpg"."content_entries" (
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_by_user_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_entries_kind_key_pk" PRIMARY KEY("kind","key"),
	CONSTRAINT "content_entries_kind_check" CHECK ("rpg"."content_entries"."kind" in ('item', 'monster', 'npc'))
);
--> statement-breakpoint
CREATE TABLE "rpg"."content_versions" (
	"version" serial PRIMARY KEY NOT NULL,
	"pack" jsonb NOT NULL,
	"notes" text,
	"published_by_user_id" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rpg"."sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"client_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
