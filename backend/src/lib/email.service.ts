import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let resend: Resend | null = null;

if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export const emailService = {
  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    if (!resend) {
      logger.warn("Resend not configured — skipping email. Set RESEND_API_KEY.");
      return;
    }

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: "Reset your Vestro password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0B1220; color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
              <span style="color: #FFFFFF;">VES</span><span style="color: #00C853;">TRO</span>
            </span>
          </div>

          <div style="background: #0D1525; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px 24px;">
            <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Reset your password</h1>
            <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 24px; line-height: 1.5;">
              We received a request to reset your Vestro password. Enter this code to continue:
            </p>

            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: rgba(0,200,83,0.1); border: 1px solid rgba(0,200,83,0.25); border-radius: 12px; padding: 16px 32px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00C853; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
            </div>

            <p style="font-size: 12px; color: rgba(255,255,255,0.35); margin: 0 0 4px; line-height: 1.4;">
              This code expires in <strong style="color: rgba(255,255,255,0.5);">15 minutes</strong>.
            </p>
            <p style="font-size: 12px; color: rgba(255,255,255,0.35); margin: 0; line-height: 1.4;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>

          <p style="font-size: 11px; color: rgba(255,255,255,0.2); text-align: center; margin-top: 28px;">
            &copy; 2026 Vestro &middot; The Social Network for Traders
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error({ msg: "Failed to send password reset email", error });
      throw new Error("Failed to send password reset email");
    }
  },
};