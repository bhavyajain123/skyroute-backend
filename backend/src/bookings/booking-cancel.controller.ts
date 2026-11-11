
import type { Request, Response } from "express";
import { cancelBooking } from "./booking-cancel.service.js";
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
  };
}
export async function cancelBookingController(
  req: AuthenticatedRequest,
     res: Response
):Promise<void> {
  try {
    const bookingReference = req.params.bookingReference;
    if (
      typeof bookingReference !== "string" ||
      !/^[A-Z0-9]{6,20}$/i.test(bookingReference)
    ) {
      res.status(400).json ({

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
    const booking = await cancelBooking(bookingReference, userId);
    res.status(200).json ({
      success:true,
      message: "Booking cancelled successfully",
      data:{

        bookingReference: booking.bookingReference,
          status: booking.status,
          
        paymentStatus: booking.paymentStatus,
        totalPassengers: booking.totalPassengers,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    const errorResponses: Record<
      string,
      { status: number; message: string }
    > = {
      booking_not_found: {
        status: 404,
        message: "Booking not found",
      },

      booking_already_cancelled: {
        status: 409,
        message: "Booking already cancelled",
      },

      completed_booking_cant_be_cancelled: {
        status: 409,
        message: "Completed booking cannot be cancelled",
      },

      refund_required_before_cancellation: {
        status: 409,
        message: "Payment refund must be completed before cancellation",
      },

      booking_already_refunded: {
        status: 409,
        message: "Booking already refunded",
      },

      flight_or_cabin_not_found: {
        status: 409,
        message: "Flight or cabin not found",
      },
            captured_payment_not_found: {
        status: 409,
        message: "Captured payment not found for this booking",
      },
    };


    
    const knownError = errorResponses[message];

    if (knownError) {
      res.status(knownError.status).json({
        success: false,
        message: knownError.message,
      });
      return;
    }

    console.error("Booking cancellation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel booking",
    });
  }
}
