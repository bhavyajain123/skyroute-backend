
import { generateAIResponse } from "../integrations/gemini/gemini.client.js";

import {
  aiFlightSearchSchema,

} from "./ai.validation.js";

import type {
  TravelRecommendationSchema,
  TravelItinerarySchema
} from "./ai.validation.js";

import { searchFlights } from "../flights/flight.service.js";
import type { FlightSearchInput } from "../flights/flight.validation.js";
import type { FlightFilterInput } from "../flights/flight-filter.validation.js";
export const generateTravelRecommendations = async (
  input: TravelRecommendationSchema
): Promise<string> => {
  const prompt = `
You are SkyRoute's AI Travel Assistant.

Create personalized travel recommendations.

Travel Details:
- Origin: ${input.origin}
- Destination: ${input.destination}
- Departure Date: ${input.departureDate ?? "Not specified"}
- Return Date: ${input.returnDate ?? "Not specified"}
- Budget: ${input.budget ?? "Not specified"} INR
- Passengers: ${input.passengers}
- Travel Class: ${input.travelClass}
- Preferences: ${input.preferences?.join(", ") || "None"}

Requirements:
1. Suggest suitable travel options.
2. Provide budget planning advice.
3. Suggest useful travel tips.
4. Consider passenger count and travel class.
5. Never invent live flight prices or availability.
6. Do not claim that a flight has been booked.

Use clear headings and bullet points.
`;

  const response = await generateAIResponse(prompt);

  if (!response.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return response;
};



export interface AIItineraryDay {
  day: number;
  title: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  foodSuggestions: string[];
  estimatedExpense: number;
}

export interface AIItineraryResult {
  destination: string;
  durationDays: number;
  travellers: number;
  overview: string;
  days: AIItineraryDay[];
  budgetBreakdown: {
    accommodation: number;
    food: number;
    localTransport: number;
    activities: number;
    miscellaneous: number;
    total: number;
  };
  travelTips: string[];
  assumptions: string[];
}

export const generateTravelItinerary = async (
  input: TravelItinerarySchema
): Promise<AIItineraryResult> => {
  const currentDate = new Date().toISOString().slice(0, 10);

  const prompt = `
You are SkyRoute AI, a professional travel itinerary planner.

Create a practical and personalized travel itinerary.

TRIP DETAILS:
Origin: ${input.origin || "Not specified"}
Destination: ${input.destination}
Start date: ${input.startDate || "Not specified"}
Duration: ${input.durationDays} days
Travellers: ${input.travellers}
Total budget: ${input.budget ?? "Not specified"} INR
Travel style: ${input.travelStyle}
Interests: ${input.interests.join(", ") || "General sightseeing"}
Special requirements: ${input.specialRequirements || "None"}
Current date: ${currentDate}

Return ONLY valid JSON. Do not use Markdown or code fences.

Use this exact structure:
{
  "destination": "Destination name",
  "durationDays": 3,
  "travellers": 2,
  "overview": "Short trip overview",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "morning": ["Activity 1"],
      "afternoon": ["Activity 2"],
      "evening": ["Activity 3"],
      "foodSuggestions": ["Local food suggestion"],
      "estimatedExpense": 2000
    }
  ],
  "budgetBreakdown": {
    "accommodation": 5000,
    "food": 3000,
    "localTransport": 2000,
    "activities": 1500,
    "miscellaneous": 1000,
    "total": 12500
  },
  "travelTips": ["Travel tip"],
  "assumptions": ["Any assumptions made"]
}

STRICT REQUIREMENTS:
1. Generate exactly ${input.durationDays} days in the days array.
2. Number days sequentially, starting from 1.
3. Include morning, afternoon and evening activities for every day.
4. Consider the user's interests, budget and travel style.
5. Suggest realistic sightseeing and food experiences.
6. Keep estimatedExpense and budgetBreakdown amounts as non-negative INR numbers.
7. Budget total must equal the sum of the five budget categories.
8. Keep the overall estimate within the user's budget when a budget is specified. If that is unrealistic, explain why in assumptions.
9. Do not invent confirmed hotel bookings, flight bookings, ticket prices or live opening hours.
10. Do not present estimated expenses as confirmed prices.
11. Avoid repeating the same activity on multiple days.
12. If the start date is specified, plan activities in chronological order.
13. Return JSON only, with no explanation outside the JSON.
`;

  const response = await generateAIResponse(prompt);

  const cleanedResponse = response
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanedResponse);
  } catch {
    throw new Error("Gemini returned invalid itinerary JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error("Invalid itinerary response from Gemini");
  }

  const result = parsed as AIItineraryResult;

  if (
    !Array.isArray(result.days) ||
    result.days.length !== input.durationDays ||
    !result.budgetBreakdown ||
    typeof result.overview !== "string"
  ) {
    throw new Error("Gemini returned an incomplete itinerary");
  }

  return result;
};



export const searchFlightsWithAI = async (
  message: string
) => {
  const currentDate = new Date().toISOString().slice(0, 10);

  const prompt = `
You are SkyRoute's AI Flight Search Assistant.

Your task is to extract flight search information
from the user's natural language request.

Current date: ${currentDate}

User request:
"${message}"

Return ONLY valid JSON. Do not use Markdown or code fences.

JSON structure:
{
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2026-12-15",
  "passengers": 1,
  "travelClass": "economy",
  "sortBy": "price_asc"
}

Rules:
1. Convert city names into correct IATA codes.
2. Never invent origin, destination or departure date.
3. If departure date is missing, omit departureDate.
4. Default passengers to 1.
5. Default travelClass to economy.
6. Cheapest flights means sortBy price_asc.
7. Include minPrice only if user specifies a minimum budget.
8. Include maxPrice only if user specifies a maximum budget.
9. Include departureTime only if user specifies a time preference.
10. Set nonstop true only when explicitly requested.
11. Omit all unspecified optional filters.
12. Never invent flight prices or availability.
13. Do not include explanations outside JSON.
`;

  const aiResponse = await generateAIResponse(prompt);

  const cleanedResponse = aiResponse
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let extractedData: unknown;

  try {
    extractedData = JSON.parse(cleanedResponse);
  } catch {
    throw new Error("Gemini returned invalid flight search JSON");
  }

  if (
    typeof extractedData !== "object" ||
    extractedData === null ||
    Array.isArray(extractedData)
  ) {
    throw new Error("Invalid flight search response from Gemini");
  }

  const extracted = extractedData as Record<string, unknown>;

  
  const missingFields: string[] = [];

  if (typeof extracted.origin !== "string" || !extracted.origin.trim()) {
    missingFields.push("departure city");
  }

  if (
    typeof extracted.destination !== "string" ||
    !extracted.destination.trim()
  ) {
    missingFields.push("destination city");
  }

  if (
    typeof extracted.departureDate !== "string" ||
    !extracted.departureDate.trim()
  ) {
    missingFields.push("departure date");
  }

  if (missingFields.length > 0) {
    return {
      status: "needs_clarification" as const,
      message: `Please provide your ${missingFields.join(", ")}.`,
      missingFields
    };
  }

  
  const validation = aiFlightSearchSchema.safeParse(extracted);

  if (!validation.success) {
    throw new Error(
      `Invalid AI flight search parameters: ${validation.error.message}`
    );
  }

  const data = validation.data;
 const departureDate = data.departureDate;

if (!departureDate) {
  return {
    status: "needs_clarification" as const,
    message: "Please provide your departure date.",
    missingFields: ["departureDate"]
  };
}

  
  const searchInput: FlightSearchInput = {
    origin: data.origin,
    destination: data.destination,
    departureDate,
    passengers: data.passengers,
    travelClass: data.travelClass,
    page: 1,
    limit: 20
  };

  const filters: FlightFilterInput = {
    minPrice: data.minPrice,
    maxPrice: data.maxPrice,
    sortBy: data.sortBy,
    departureTime: data.departureTime,
    nonstop: data.nonstop
  };

  const result = await searchFlights(searchInput, filters);

  return {
    status: "success" as const,
    message: result.flights.length
      ? "AI flight search completed successfully"
      : "No flights found for your selected search",
    searchFilters: {
      ...data
    },
    data: result
  };
};
