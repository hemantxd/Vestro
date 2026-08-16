// Development-only test: send a sample password-reset OTP email via Resend
// using the shared `onboarding@resend.dev` sender (no custom domain needed).
//
// Usage:
//   RESEND_API_KEY=re_xxx EMAIL_FROM="Vestro <onboarding@resend.dev>" \
//     npm run email:test -- you@example.com
//
// Note: Resend's unverified `onboarding@resend.dev` sender in development can
// usually only deliver to Resend's test-only recipients (e.g. delivered@resend.dev)
// until you verify your own sending domain. See the README notes in this repo.
import "dotenv/config";
import { emailService } from "../src/lib/email.service.js";
import { env } from "../src/config/env.js";

async function main() {
  const to = process.argv[2]?.trim();
  if (!to) {
    console.error("Usage: npm run email:test -- <recipient@example.com>");
    process.exit(1);
  }
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Cannot send email.");
    process.exit(1);
  }

  const sampleOtp = "483920";

  try {
    await emailService.sendPasswordResetOtp(to, sampleOtp);
    console.log(`✅ Test OTP email sent from "${env.EMAIL_FROM}" to "${to}".`);
  } catch (err) {
    console.error("❌ Failed to send test email:", err instanceof Error ? err.message : err);
    console.error(
      "\nResend limitation reminder: the onboarding@resend.dev sender only delivers\n" +
        "to verified recipients (resend.dev test addresses) until you add a real\n" +
        "verified from-domain. Try: npm run email:test -- delivered@resend.dev"
    );
    process.exit(1);
  }
}

main();