
import type { Request, Response } from "express";
import { getFlightById } from "./flight-details.service.js";

export async function getFlightDetails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const flightId = req.params.id;

    if (typeof flightId !=="string" ||!flightId.trim()){
      res.status(400).json({
        success: false,
        message: "Invalid flight ID"
      });
      return;
    }

    const flight = await getFlightById(flightId);

    res.status(200).json({
      success: true,
      message: "Flight details retrieved successfully",
      data: flight
    });
  } catch (error:unknown) {
   if (error instanceof Error) {
      if (error.message === "INVALID_FLIGHT_ID") {
        res.status(400).json({
          success: false,
          message: "Invalid flight ID",
        });
        return;
      }

      if (error.message === "FLIGHT_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Flight not found",
        });
        return;
      }
    }

    console.error("Flight Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve flight details"
    });
  }
};
