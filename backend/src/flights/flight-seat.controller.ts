
import type { Request, Response } from "express";
import { getFlightSeatMap } from "./flight-seat.service.js";

export async function getFlightSeatMapController(
  req: Request,
  res: Response
) {
  try {
    const flightId = Array.isArray(req.params.flightId)
  ? req.params.flightId[0] ?? ""
  : req.params.flightId ?? "";
    const cabinClass = String(req.query.cabinClass || "economy");

    const result = await getFlightSeatMap(
      flightId,
      cabinClass
    );

    return res.status(200).json({
      success: true,
      message: "Seat map fetched successfully",
      data: result
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";

    const statusCode =
      message === "INVALID_FLIGHT_ID" ? 400 :
      message === "FLIGHT_NOT_FOUND" ? 404 :
      message === "CABIN_CLASS_NOT_AVAILABLE" ? 404 :
      500;

    return res.status(statusCode).json({
      success: false,
      message
    });
  }
}
