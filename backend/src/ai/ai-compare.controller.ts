import type { Request, Response, NextFunction } from "express";

import { aiCompareFlightsSchema } from "./ai.validation.js";
import { compareFlights } from "./ai-compare.service.js";

export const compareFlightsUsingAI = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = aiCompareFlightsSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid flight comparison details",
        errors: validation.error.flatten()
      });
      return;
    }

    const result = await compareFlights(validation.data);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};