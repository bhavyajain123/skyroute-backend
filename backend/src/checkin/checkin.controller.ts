
import type { Request, Response } from "express";
import { Types } from "mongoose";

import {
  getCheckInEligibility,
  createCheckIn,
} from "./checkin.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getUserId(req: AuthenticatedRequest): Types.ObjectId {
  const userId = req.user?.id;

  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error("AUTH_REQUIRED");
  }

  return new Types.ObjectId(userId);
}

function handleError(error: unknown, res: Response) {
  const message =
    error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";

  const statusMap: Record<string, number> = {
    AUTH_REQUIRED: 401,
    INVALID_BOOKING_ID: 400,
    INVALID_ID: 400,
    BOOKING_NOT_FOUND: 404,
    FLIGHT_NOT_FOUND: 404,
    PASSENGER_NOT_FOUND: 404,
    BOOKING_NOT_CONFIRMED: 400,
    PAYMENT_NOT_COMPLETED: 400,
    FLIGHT_NOT_AVAILABLE_FOR_CHECKIN: 400,
    CHECKIN_NOT_OPEN: 403,
    CHECKIN_CLOSED: 403,
    SEAT_ASSIGNMENT_MISSING: 400,
    PASSENGER_NOT_IN_BOOKING: 403,
    PASSENGER_SEAT_NOT_ASSIGNED: 400,
    ALREADY_CHECKED_IN: 409,
  };

  return res.status(statusMap[message] ?? 500).json({
    success: false,
    message,
  });
}


export async function checkInEligibility(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = getParam(req.params.bookingId);
    const userId = getUserId(req);

    const result = await getCheckInEligibility(bookingId, userId);

    return res.status(200).json({
      success: true,
      message: "Booking is eligible for check-in",
      data: {
        bookingReference: result.booking.bookingReference,
        flightNumber: result.flight.flightNumber,
        departureTime: result.flight.departureTime,
        opensAt: result.opensAt,
        closesAt: result.closesAt,
        passengers: result.seatAssignments.map((item) => ({
          passengerId: item.passenger,
          seatNumber: item.seatNumber,
        })),
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
}


export async function checkInPassenger(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = getParam(req.params.bookingId);
    const passengerId = req.body.passengerId;
    const userId = getUserId(req);

    if (
      typeof passengerId !== "string" ||
      !Types.ObjectId.isValid(passengerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "INVALID_PASSENGER_ID",
      });
    }

    const result = await createCheckIn(
      bookingId,
      passengerId,
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Check-in completed successfully",
      data: result,
    });
  } catch (error) {
    return handleError(error, res);
  }
}
