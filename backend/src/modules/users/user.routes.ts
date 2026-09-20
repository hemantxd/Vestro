import { Router } from "express";
import { userController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../../middleware/upload.middleware.js";
import { updateProfileSchema } from "./user.schema.js";
import { readLimiter, uploadLimiter, writeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Search must come BEFORE /:username to avoid "search" being caught as a username
router.get("/search", readLimiter as any, authenticate, userController.searchUsers);
// Suggested "traders to follow" — also before /:username
router.get("/suggested", readLimiter as any, authenticate, userController.getSuggestedUsers);

// Public routes
router.get("/:username", readLimiter as any, userController.getProfileByUsername);
router.get("/profile/:userId", readLimiter as any, userController.getProfile);

// Protected routes
router.patch("/profile", writeLimiter as any, authenticate, validate(updateProfileSchema as any), userController.updateProfile);
router.post("/profile/picture", uploadLimiter as any, authenticate, uploadProfilePicture, userController.updateProfilePicture);
router.post("/profile/cover", uploadLimiter as any, authenticate, uploadProfilePicture, userController.updateCoverImage);
router.delete("/profile/picture", writeLimiter as any, authenticate, userController.deleteProfilePicture);

export default router;