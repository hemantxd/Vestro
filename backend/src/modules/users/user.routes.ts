import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../../middleware/upload.middleware.js";
import { updateProfileSchema } from "./user.schema.js";

const router = Router();

// Search must come BEFORE /:username to avoid "search" being caught as a username
router.get("/search", authenticate, userController.searchUsers);

// Public routes
router.get("/:username", userController.getProfileByUsername);
router.get("/profile/:userId", userController.getProfile);

// Protected routes
router.patch("/profile", authenticate, validate(updateProfileSchema as any), userController.updateProfile);
router.post("/profile/picture", authenticate, uploadProfilePicture, userController.updateProfilePicture);
router.post("/profile/cover", authenticate, uploadProfilePicture, userController.updateCoverImage);
router.delete("/profile/picture", authenticate, userController.deleteProfilePicture);

export default router;