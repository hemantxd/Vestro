import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema, googleLoginSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema as any), authController.register as any);
router.post("/login", validate(loginSchema as any), authController.login as any);
router.post("/google", validate(googleLoginSchema as any), authController.googleLogin as any);
router.post("/refresh", authController.refresh as any);
router.post("/logout", authController.logout as any);
router.post("/logout-all", authenticate as any, authController.logoutAll as any);
router.get("/me", authenticate as any, authController.me as any);

export default router;