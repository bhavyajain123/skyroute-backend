
import type { Request, Response } from "express";

import { flightSearchSchema } from "./flight.validation.js";
import { flightFilterSchema } from "./flight-filter.validation.js";
import { searchFlights, getAvailableRoutes, } from "./flight.service.js";

export const getFlights = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
  
     const searchQuery = flightSearchSchema.safeParse(req.query);

if (!searchQuery.success) {
      res.status(400).json({
        success: false,
        message: "Invalid flight search parameters",
        errors: searchQuery.error.flatten(),
      });
      return;
    }


    const filters = flightFilterSchema.safeParse(req.query);

    if (!filters.success) {
      res.status(400).json({
        success: false,
        message: "Invalid flight filter parameters",
        errors: filters.error.flatten(),
      });
      return;
    }

    const result = await searchFlights(
      searchQuery.data,
      filters.data
    );

    res.status(200).json({
      success: true,
      message: result.flights.length
        ? "Flights retrieved successfully"
        : "No flights found for the selected route",
      data: result
    });
  } catch (error) {
    console.error("Flight Search Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to search flights. Please try again."
    });
  }
};

export const getAvailableRoutesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const routes = await getAvailableRoutes();

    res.status(200).json({
      success: true,
      message: "Available routes retrieved successfully",
      data: {
        routes,
        total: routes.length,
      },
    });
  } catch (error) {
    console.error("Get available routes error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve available routes",
    });
  }
};
