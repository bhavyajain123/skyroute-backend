import type { Request, Response, NextFunction } from "express";
import { getAdminAnalytics } from "./admin-analytics.service.js";

export const getAdminAnalyticsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analytics = await getAdminAnalytics();

    res.status(200).json({
      success: true,
      message: "Admin analytics fetched successfully",
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};