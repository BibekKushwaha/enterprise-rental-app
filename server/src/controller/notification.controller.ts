import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /notifications?userId=...&userType=...
 * Returns notifications for the authenticated user, newest first.
 */
export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      res.status(400).json({ message: "userId and userType are required." });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: String(userId),
        userType: String(userType),
      },
      orderBy: { createdAt: "desc" },
      take: 50, // cap at 50 latest
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching notifications: ${error.message}` });
  }
};

/**
 * PUT /notifications/:id/read
 * Marks a single notification as read.
 */
export const markNotificationRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });

    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: `Error marking notification read: ${error.message}` });
  }
};

/**
 * PUT /notifications/read-all?userId=...&userType=...
 * Marks all notifications for a user as read.
 */
export const markAllRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      res.status(400).json({ message: "userId and userType are required." });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        userId: String(userId),
        userType: String(userType),
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: `Error marking all notifications read: ${error.message}` });
  }
};
