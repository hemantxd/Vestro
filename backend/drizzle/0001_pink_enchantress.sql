ALTER TABLE "posts" ADD COLUMN "ticker" varchar(20);--> statement-breakpoint
CREATE INDEX "post_ticker_idx" ON "posts" USING btree ("ticker");