import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema as any), authController.register);
router.post("/login", validate(loginSchema as any), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.me);

export default router;