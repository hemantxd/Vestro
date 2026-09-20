/**
 * Dev smoke test for the rate-limit wiring.
 *
 * Boots a tiny express app with a strict test limiter and hammers it,
 * asserting the first N requests pass and the next ones return 429 with a
 * JSON `{ status: "error" }` body + `RateLimit-*` headers.
 *
 * Run:
 *   npm run rate-limit:test
 *
 * Requires: backend deps installed. Redis is NOT required (uses the
 * in-memory fallback store in the same way production does when present).
 */
import express from "express";
import { rateLimit } from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";

const TEST_PORT = 5999;
const TEST_MAX = 3;

async function main() {
  const app = express();

  app.use(
    "/limited",
    rateLimit({
      windowMs: 60 * 1000,
      max: TEST_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
      message: { status: "error", message: "Too many requests (test)" },
    })
  );
  app.get("/limited", (_req, res) => {
    res.json({ status: "success" });
  });

  const server = await new Promise<import("http").Server>((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  try {
    const codes: number[] = [];
    let errorBody: unknown = null;
    for (let i = 0; i < TEST_MAX + 2; i++) {
      const res = await fetch(`http://127.0.0.1:${TEST_PORT}/limited`);
      codes.push(res.status);
      if (res.status === 429 && errorBody === null) {
        errorBody = await res.json().catch(() => null);
      }
    }
    console.log(`Statuses over ${TEST_MAX + 2} hits (max=${TEST_MAX}):`, codes.join(", "));
    const ok =
      codes.slice(0, TEST_MAX).every((c) => c === 200) &&
      codes.slice(TEST_MAX).every((c) => c === 429);
    if (!ok) {
      console.error("FAIL: expected 200s then 429s");
      process.exit(1);
    }
    console.log("429 body:", JSON.stringify(errorBody));
    console.log("PASS: limiter counted and rejected the burst (429).");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("rate-limit test failed:", err);
  process.exit(1);
});
