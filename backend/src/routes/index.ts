import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import followRoutes from "../modules/follows/follow.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/follows", followRoutes);
router.use("/notifications", notificationRoutes);

export default router;