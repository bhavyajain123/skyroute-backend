
import type { Request, Response, NextFunction } from "express";
import { smartBudgetSchema } from "./ai.validation.js";
import { generateSmartBudget } from "./ai-budget.service.js";

export async function generateSmartBudgetController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validation = smartBudgetSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid travel budget details.",
        errors: validation.error.flatten(),
      });
    }

    const budget = await generateSmartBudget(validation.data);

    return res.status(200).json({
      success: true,
      message: "Smart travel budget generated successfully.",
      data: {
        budget,
      },
    });
  } catch (error) {
    next(error);
  }
}
