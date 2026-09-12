import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "../controller/notification.controller.js";

const router = express.Router();

// GET /notifications?userId=...&userType=...
router.get("/", authMiddleware(["manager", "tenant"]), getNotifications);

// PUT /notifications/read-all?userId=...&userType=...
// Must be registered BEFORE /:id/read to avoid conflict
router.put("/read-all", authMiddleware(["manager", "tenant"]), markAllRead);

// PUT /notifications/:id/read
router.put("/:id/read", authMiddleware(["manager", "tenant"]), markNotificationRead);

export default router;
