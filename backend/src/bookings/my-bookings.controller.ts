
import type { Request, Response } from "express";
import { getMyBookings } from "./my-bookings.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
  };
}
const allowedStatuses =[
  "pending",
  "confirmed",
  "cancelled",
  "completed"
] as const;
type BookingStatus = (typeof allowedStatuses)[number];

export async function getMyBookingsController(
   req: AuthenticatedRequest,

  res: Response
): Promise<void>{
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to view your bookings"
      });
      return;
    }
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) || page < 1 || !Number.isInteger(limit) ||  limit < 1 || limit > 50 ) {
     
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters"
      });
      return;
    }

    const statusValue = req.query.status;
    let status: BookingStatus | undefined;
    if (statusValue !== undefined) {
      if (
        typeof statusValue !== "string" ||
        !allowedStatuses.includes(statusValue as BookingStatus)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid booking status"
        });
        return;
      }
      status = statusValue as BookingStatus;
    }
    const result = await getMyBookings(userId, {
      page,
      limit,
      ...(status ? { status } : {})
    });
    res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data: result
    });
  } catch (error: unknown) {
    console.error("Get my bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve bookings"
    });
  }
}
