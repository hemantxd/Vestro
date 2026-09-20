import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema.js";
import { authLimiter, authLimiterStrict } from "../../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter as any, validate(registerSchema as any), authController.register as any);
router.post("/login", authLimiter as any, validate(loginSchema as any), authController.login as any);
router.post("/google", authLimiter as any, validate(googleLoginSchema as any), authController.googleLogin as any);
router.post("/refresh", authLimiter as any, authController.refresh as any);
router.post("/logout", authController.logout as any);
router.post("/logout-all", authenticate as any, authController.logoutAll as any);
router.get("/me", authenticate as any, authController.me as any);

// Public password-reset routes (strictest: OTP email bombing / OTP guessing)
router.post("/forgot-password", authLimiterStrict as any, validate(forgotPasswordSchema as any), authController.forgotPassword as any);
router.post("/reset-password", authLimiterStrict as any, validate(resetPasswordSchema as any), authController.resetPassword as any);

export default router;