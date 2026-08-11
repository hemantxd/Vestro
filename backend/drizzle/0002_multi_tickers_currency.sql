CREATE TABLE "post_tickers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"ticker" varchar(20) NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "currency" varchar(10) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "post_tickers" ADD CONSTRAINT "post_tickers_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ticker_post_idx" ON "post_tickers" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_tickers_ticker_idx" ON "post_tickers" USING btree ("ticker");--> statement-breakpoint
-- Backfill existing single-post tickers into the new multi-ticker table
-- (runs before the legacy "posts.ticker" column is dropped in 0003).
INSERT INTO "post_tickers" ("post_id", "ticker", "order_index")
SELECT "id", "ticker", 0 FROM "posts"
WHERE "ticker" IS NOT NULL AND "ticker" <> '';