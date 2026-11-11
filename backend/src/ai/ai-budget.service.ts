
import { generateAIResponse } from "../integrations/gemini/gemini.client.js";
import type { SmartBudgetInput } from "./ai.validation.js";

export interface SmartBudgetResult {
  origin: string;
  destination: string;
  durationDays: number;
  travellers: number;
  totalBudget: number;
  currency: string;
  budgetBreakdown: {
    flights: number;
    accommodation: number;
    food: number;
    localTransport: number;
    activities: number;
    miscellaneous: number;
    total: number;
    remaining: number;
  };
  dailyBudget: number;
  dailyExpensePlan: {
    day: number;
    estimatedExpense: number;
    activities: string[];
  }[];
  moneySavingTips: string[];
  recommendations: string[];
  budgetStatus: "within_budget" | "over_budget";
  assumptions: string[];
}

export async function generateSmartBudget(
  input: SmartBudgetInput
): Promise<SmartBudgetResult> {
  const prompt = `
You are SkyRoute AI, an intelligent travel budget planning assistant.

Create a practical travel budget using these details:

Origin: ${input.origin}
Destination: ${input.destination}
Duration: ${input.durationDays} days
Travellers: ${input.travellers}
Total budget: INR ${input.totalBudget}
Travel style: ${input.travelStyle}
Interests: ${input.interests.join(", ") || "General sightseeing"}

Return ONLY valid JSON. Do not use Markdown code fences.

Follow this exact structure:

{
  "origin": "${input.origin}",
  "destination": "${input.destination}",
  "durationDays": ${input.durationDays},
  "travellers": ${input.travellers},
  "totalBudget": ${input.totalBudget},
  "currency": "INR",
  "budgetBreakdown": {
    "flights": 0,
    "accommodation": 0,
    "food": 0,
    "localTransport": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0,
    "remaining": 0
  },
  "dailyBudget": 0,
  "dailyExpensePlan": [
    {
      "day": 1,
      "estimatedExpense": 0,
      "activities": ["Activity"]
    }
  ],
  "moneySavingTips": ["Tip"],
  "recommendations": ["Recommendation"],
  "budgetStatus": "within_budget",
  "assumptions": ["Assumption"]
}

Rules:
1. All monetary values must be INR numbers.
2. Budget breakdown total must equal the sum of all six expense categories.
3. Remaining = totalBudget - budgetBreakdown.total.
4. Never make the total expenses exceed totalBudget unless absolutely necessary.
5. If expenses exceed the budget, set budgetStatus to "over_budget".
6. Create exactly ${input.durationDays} dailyExpensePlan entries.
7. Daily expense estimates should be realistic for the destination and traveller count.
8. Include practical saving tips and recommendations.
9. Do not claim that prices are live or confirmed.
10. Do not invent confirmed flight or hotel bookings.
11. Return valid JSON only.
`;

  const aiResponse = await generateAIResponse(prompt);

  const cleanedResponse = aiResponse
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed: SmartBudgetResult;

try {
  parsed = JSON.parse(cleanedResponse) as SmartBudgetResult;
} catch {
  throw new Error("Gemini returned invalid budget JSON.");
}

  if (
    !parsed.budgetBreakdown ||
    !Array.isArray(parsed.dailyExpensePlan) ||
    !Array.isArray(parsed.moneySavingTips) ||
    !Array.isArray(parsed.recommendations)
  ) {
    throw new Error("AI returned an invalid budget structure.");
  }

  if (parsed.dailyExpensePlan.length !== input.durationDays) {
    throw new Error("AI returned an incorrect number of travel days.");
  }

  const categories = [
    parsed.budgetBreakdown.flights,
    parsed.budgetBreakdown.accommodation,
    parsed.budgetBreakdown.food,
    parsed.budgetBreakdown.localTransport,
    parsed.budgetBreakdown.activities,
    parsed.budgetBreakdown.miscellaneous,
  ];

  const calculatedTotal = categories.reduce(
    (sum, amount) => sum + Number(amount),
    0
  );

  if (
    categories.some((amount) => !Number.isFinite(Number(amount)) || Number(amount) < 0) ||
    !Number.isFinite(calculatedTotal)
  ) {
    throw new Error("AI returned invalid budget amounts.");
  }

  // Recalculate totals instead of trusting AI arithmetic.
  parsed.budgetBreakdown.total = calculatedTotal;
  parsed.budgetBreakdown.remaining =
    input.totalBudget - calculatedTotal;

  parsed.dailyBudget = calculatedTotal / input.durationDays;
  parsed.budgetStatus =
    calculatedTotal > input.totalBudget
      ? "over_budget"
      : "within_budget";

  return parsed;
}
