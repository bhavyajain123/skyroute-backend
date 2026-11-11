
import type { Request, Response, NextFunction } from "express";

import { travelItinerarySchema } from "./ai.validation.js";
import { generateTravelItinerary } from "./ai.service.js";

export const getTravelItinerary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = travelItinerarySchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid itinerary details",
        errors: validation.error.flatten()
      });
      return;
    }

    const itinerary = await generateTravelItinerary(validation.data);

    res.status(200).json({
      success: true,
      message: "AI travel itinerary generated successfully",
      data: {
        itinerary
      }
    });
  } catch (error) {
    next(error);
  }
};
