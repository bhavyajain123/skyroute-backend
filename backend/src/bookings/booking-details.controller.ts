import type {Request, Response} from "express";
import { getBookingByReference } from "./booking-details.service.js";
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
  };
}

export async function getBookingByReferenceController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const bookingReference = req.params.bookingReference;

    if (
      typeof bookingReference !== "string" ||
      !/^[A-Z0-9]{6,20}$/i.test(bookingReference)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking reference",
      });
      return;
    }
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const booking = await getBookingByReference( bookingReference,userId);
     
    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error: unknown){
    if (
      error instanceof Error &&
      error.message === "booking_not_found"
    ) {
      res.status(404).json({ success: false, message: "Booking not found", });
      return;
    }
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve booking",
    });
  }
}