CREATE TABLE "creator_rate_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"rate_per_video" integer,
	"rate_per_photo" integer,
	"rate_per_reel" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_rate_cards_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "deal_decodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"verdict" varchar(20) NOT NULL,
	"recommended_counter_low" integer NOT NULL,
	"recommended_counter_high" integer NOT NULL,
	"original_offer_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_rate_cards" ADD CONSTRAINT "creator_rate_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_decodes" ADD CONSTRAINT "deal_decodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;