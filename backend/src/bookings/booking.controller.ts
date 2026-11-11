
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { createBookingSchema } from "./booking.validation.js";
import { createBooking } from "./booking.service.js";

interface AuthenticatedRequest extends Request {
  user?: { id?: string;};
}

export async function createBookingController(
   req: AuthenticatedRequest,

  res: Response
): Promise<void> {
  try {
    const bookingData = createBookingSchema.safeParse(req.body);

    if (!bookingData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid booking details",
        errors: bookingData.error.flatten(),
      });
      return;
    }

    const rawUserId = req.user?.id;
    let userId: Types.ObjectId | undefined;

    if (rawUserId) {
      if (!Types.ObjectId.isValid(rawUserId)) {
        res.status(401).json({
          success: false,
          message: "Invalid authentication user",
        });
        return;
      }
      userId = new Types.ObjectId(rawUserId);
    }
    const booking = await createBooking(
      bookingData.data,
      userId
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully. Payment pending.",
      data: {
        bookingReference: booking.bookingReference,
        bookingId: booking._id,
        flight: booking.flight,
        passengers: booking.passengers,
        totalPassengers: booking.totalPassengers,
        cabinClass: booking.cabinClass,
        baseFare: booking.baseFare,
        taxes: booking.taxes,
        discount: booking.discount,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookedAt: booking.bookedAt,
      },
    });

  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "";
    const errorResponses: Record<
      string,
      { status: number; message: string }
    > = {
      AUTH_REQUIRED_FOR_SAVED_PASSENGERS: {
        status: 401,
        message: "Login is required to select saved passengers",
      },

      invalid_or_unauthorized_passenger: {
        status: 403,
        message: "One or more passengers are invalid",
      },
      invalid_passenger_count: {
        status: 400,
        message: "Passenger count must be between 1 and 9",
      },
      flight_not_available: {
        status: 404,
        message: "Flight is not available for booking",
      },

      cabin_class_not_available: {
        status: 400,
        message: "Selected cabin class is not available",
      },
      not_enough_seats: {
        status: 409,
        message: "Seat reservation failed",
      },
    };

    const knownError = errorResponses[errorMessage];
    if (knownError) {
      res.status(knownError.status).json({
        success: false,
        message: knownError.message,
      });
      return;
    }

    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create booking",
    });
  }
}
