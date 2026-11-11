import {Router} from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { getMyNotificationsController,getUnreadNotificationCountController,markNotificationAsReadController,markAllNotificationsAsReadController,deleteNotificationController } from "./notification.controller.js";

const router= Router();
router.use(authenticate);

router.get("/", getMyNotificationsController);
router.get("/unread-count", getUnreadNotificationCountController);
router.patch("/read-all",markAllNotificationsAsReadController);
router.patch("/:notificationId/read", markAllNotificationsAsReadController);
router.delete("/:notificationId", deleteNotificationController);

export default router;