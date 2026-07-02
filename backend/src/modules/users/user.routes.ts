import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { updateProfileSchema } from "./user.schema.js";

const router = Router();

router.get("/search", authenticate, userController.searchUsers);
router.get("/:username", userController.getProfileByUsername);
router.get("/profile/:userId", userController.getProfile);
router.patch("/profile", authenticate, validate(updateProfileSchema as any), userController.updateProfile);

export default router;