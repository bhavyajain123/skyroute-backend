
import type { Request, Response } from "express";
import { getFlightAvailability } from "./flight-availability.service.js";

export const getFlightAvailabilityController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const origin = String(req.query.origin || "").trim().toUpperCase();
    const destination = String(req.query.destination || "").trim().toUpperCase();
    const month = String(req.query.month || "").trim();
    const passengers = Number(req.query.passengers || 1);
    const travelClass = String(req.query.travelClass || "economy");

 
    if (!origin || !destination || !month) {
      res.status(400).json({
        success: false,
        message: "Origin, destination and month are required."
      });
      return;
    }

    if (!/^[A-Z]{3}$/.test(origin) ||
        !/^[A-Z]{3}$/.test(destination)) {
      res.status(400).json({
        success: false,
        message: "Invalid airport code."
      });
      return;
    }

    if (origin === destination) {
      res.status(400).json({
        success: false,
        message: "Origin and destination cannot be the same."
      });
      return;
    }

  
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format."
      });
      return;
    }

    if (
      !Number.isInteger(passengers) ||
      passengers < 1 ||
      passengers > 9
    ) {
      res.status(400).json({
        success: false,
        message: "Passengers must be between 1 and 9."
      });
      return;
    }

   
    const allowedClasses = [
      "economy",
      "premium_economy",
      "business",
      "first"
    ];

    if (!allowedClasses.includes(travelClass)) {
      res.status(400).json({
        success: false,
        message: "Invalid travel class."
      });
      return;
    }

    const dates = await getFlightAvailability({
      origin,
      destination,
      month,
      passengers,
      travelClass: travelClass as
        | "economy"
        | "premium_economy"
        | "business"
        | "first"
    });

    res.status(200).json({
      success: true,
      message: "Flight availability retrieved successfully.",
      data: {
        origin,
        destination,
        month,
        dates
      }
    });

  } catch (error) {
    console.error("Flight Availability Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve flight availability."
    });
  }
};
