CREATE TABLE "deal_decode_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"decode_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deal_decode_usage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DROP TABLE "daily_challenge_entries" CASCADE;--> statement-breakpoint
DROP TABLE "user_progress" CASCADE;--> statement-breakpoint
ALTER TABLE "deal_decode_usage" ADD CONSTRAINT "deal_decode_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;