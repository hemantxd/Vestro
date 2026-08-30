-- Remove existing duplicate notifications (keep the newest row per unique key)
-- so the unique index below can be created cleanly.
DELETE FROM "notifications" a
USING "notifications" b
WHERE a."id" < b."id"
  AND a."user_id" = b."user_id"
  AND a."type" = b."type"
  AND a."actor_id" = b."actor_id"
  AND a."entity_id" IS NOT DISTINCT FROM b."entity_id";
--> statement-breakpoint
CREATE UNIQUE INDEX "notif_unique_key" ON "notifications" USING btree ("user_id","type","actor_id","entity_id");