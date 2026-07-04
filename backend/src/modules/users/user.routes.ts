import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../../middleware/upload.middleware.js";
import { updateProfileSchema } from "./user.schema.js";

const router = Router();

// Public routes
router.get("/:username", userController.getProfileByUsername);
router.get("/profile/:userId", userController.getProfile);

// Protected routes
router.get("/search", authenticate, userController.searchUsers);
router.patch("/profile", authenticate, validate(updateProfileSchema as any), userController.updateProfile);
router.post("/profile/picture", authenticate, uploadProfilePicture, userController.updateProfilePicture);
router.delete("/profile/picture", authenticate, userController.deleteProfilePicture);

export default router;