
import { Router } from "express";
import { getAdminDashboard } from "./admin-dashboard.controller.js";
import { getAdminAnalyticsController } from "./admin-analytics.controller.js";
import { authenticate, authorizeAdmin } from "../auth/auth.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeAdmin,
  getAdminDashboard
);

router.get(
  "/analytics",
  authenticate,
  authorizeAdmin,
  getAdminAnalyticsController
);

export default router;
