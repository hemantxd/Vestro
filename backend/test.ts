import "dotenv/config";
import { Client } from "pg";

console.log("Connecting to database...");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected");

    const result = await client.query("SELECT NOW()");
    console.log(result.rows);

    await client.end();
  } catch (e) {
    console.error(e);
  }
})();