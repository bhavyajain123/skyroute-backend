
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { z } from "zod";
import { lockFlightSeats } from "./flight-seat.service.js";
const lockSeatsSchema = z.object({
  flightId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  cabinClass: z.enum([
    "economy",
    "premium_economy",
    "business",
    "first"
  ]),
  seatNumbers: z.array(
    z.string().trim().min(2).max(4)
  ).min(1).max(9)
});

export async function lockFlightSeatsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const parsed = lockSeatsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat selection",
        errors: parsed.error.flatten()
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const result = await lockFlightSeats(
      parsed.data.flightId,
      parsed.data.cabinClass,
      parsed.data.seatNumbers,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Seats locked successfully for 10 minutes",
      data: result
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";

    const status =
      message === "SEAT_NOT_AVAILABLE" ? 409 :
      message === "FLIGHT_NOT_AVAILABLE" ? 404 :
      message === "CABIN_CLASS_NOT_AVAILABLE" ? 400 :
      400;

    return res.status(status).json({
      success: false,
      message
    });
  }
}
