import "dotenv/config";
import { db } from "./index.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    // Check if follows table has status column
    const columnsResult = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'status';`
    );

    if (columnsResult.rows.length > 0) {
      await db.execute(sql`ALTER TABLE follows DROP COLUMN IF EXISTS status;`);
      console.log("✓ Dropped status column from follows");
    } else {
      console.log("→ status column already removed from follows");
    }

    // Drop updated_at from follows if exists
    const updatedAtResult = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'updated_at';`
    );
    if (updatedAtResult.rows.length > 0) {
      await db.execute(sql`ALTER TABLE follows DROP COLUMN IF EXISTS updated_at;`);
      console.log("✓ Dropped updated_at column from follows");
    }

    // Check if follows table exists
    const tablesResult = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    const existingTables = tablesResult.rows.map((r: any) => r.table_name);
    console.log("Existing tables:", existingTables);

    if (!existingTables.includes("follows")) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS follows (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
        );
      `);
      console.log("✓ follows table created");
    } else {
      console.log("→ follows table already exists");
    }

    if (!existingTables.includes("notifications")) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(30) NOT NULL,
          actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          entity_id UUID,
          entity_type VARCHAR(30),
          message TEXT,
          read BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS notif_user_idx ON notifications(user_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS notif_unread_idx ON notifications(user_id, read);`);
      console.log("✓ notifications table created with indexes");
    } else {
      console.log("→ notifications table already exists");
    }

    console.log("✅ Migration complete!");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
  }
  process.exit(0);
}

run();