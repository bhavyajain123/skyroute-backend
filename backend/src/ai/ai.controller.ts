
import type { Request, Response, NextFunction } from "express";
import {
  travelRecommendationSchema,
  aiFlightPromptSchema
} from "./ai.validation.js";

import {
  generateTravelRecommendations,
  searchFlightsWithAI
} from "./ai.service.js";


export const getTravelRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = travelRecommendationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid travel details",
        errors: validation.error.flatten()
      });
      return;
    }

    const recommendations = await generateTravelRecommendations(
      validation.data
    );

    res.status(200).json({
      success: true,
      message: "AI travel recommendations generated successfully",
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};


export const searchFlightsUsingAI = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("[AI] Flight search request received");

    const validation = aiFlightPromptSchema.safeParse(req.body);

    if (!validation.success) {
      console.log("[AI] Validation failed");

      res.status(400).json({
        success: false,
        message: "Invalid AI flight search request",
        errors: validation.error.flatten()
      });
      return;
    }

    console.log("[AI] Validation successful");
    console.log("[AI] User message:", validation.data.message);

    const result = await searchFlightsWithAI(validation.data.message);

    console.log("[AI] Service completed:", result.status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error("[AI] Controller error:", error);
    next(error);
  }
};

