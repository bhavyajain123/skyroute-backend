
import { z } from "zod";


export const travelRecommendationSchema = z
  .object({
    origin: z.string().trim().min(2).max(100),
    destination: z.string().trim().min(2).max(100),
    departureDate: z.string().date().optional(),
    returnDate: z.string().date().optional(),
    budget: z.number().positive().optional(),
    passengers: z.number().int().min(1).max(9).default(1),

    travelClass: z
      .enum([
        "economy",
        "premium_economy",
        "business",
        "first"
      ])
      .default("economy"),

    preferences: z
      .array(z.string().trim().min(2).max(50))
      .max(10)
      .optional()
  })
  .refine(
    (data) => data.origin.toLowerCase() !== data.destination.toLowerCase(),
    {
      message: "Origin and destination must be different",
      path: ["destination"]
    }
  )
  .refine(
    (data) =>
      !data.departureDate ||
      !data.returnDate ||
      data.returnDate >= data.departureDate,
    {
      message: "Return date must be after or equal to departure date",
      path: ["returnDate"]
    }
  );


export const travelItinerarySchema = z.object({
  origin: z.string().trim().min(2).max(100).optional(),

  destination: z.string().trim().min(2).max(100),

  startDate: z.string().date().optional(),

  durationDays: z.number().int().min(1).max(30),

  travellers: z.number().int().min(1).max(20).default(1),

  budget: z.number().positive().optional(),

  travelStyle: z
    .enum(["relaxed", "balanced", "packed"])
    .default("balanced"),

  interests: z
    .array(z.string().trim().min(2).max(50))
    .max(10)
    .default([]),

  specialRequirements: z
    .string()
    .trim()
    .max(500)
    .optional()
});



export const aiFlightPromptSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Please enter a valid flight search request")
    .max(1000, "Flight search request is too long")
});


export const aiFlightSearchSchema = z
  .object({
    origin: z.string().trim().length(3).toUpperCase(),

    destination: z.string().trim().length(3).toUpperCase(),

    departureDate: z.string().date().optional(),

    passengers: z.number().int().min(1).max(9).default(1),

    travelClass: z
      .enum([
        "economy",
        "premium_economy",
        "business",
        "first"
      ])
      .default("economy"),

    minPrice: z.number().min(0).optional(),

    maxPrice: z.number().min(0).optional(),

    sortBy: z
      .enum([
        "price_asc",
        "price_desc",
        "departure_asc",
        "departure_desc",
        "duration_asc"
      ])
      .default("price_asc"),

    departureTime: z
      .enum([
        "early_morning",
        "morning",
        "afternoon",
        "evening"
      ])
      .optional(),

    nonstop: z.boolean().optional()
  })
  .refine(
    (data) => data.origin !== data.destination,
    {
      message: "Origin and destination must be different",
      path: ["destination"]
    }
  )
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot exceed maximum price",
      path: ["maxPrice"]
    }
  );


export type TravelRecommendationSchema = z.infer<
  typeof travelRecommendationSchema
>;

export type TravelItinerarySchema = z.infer<
  typeof travelItinerarySchema
>;


export type AIFlightPromptInput = z.infer<
  typeof aiFlightPromptSchema
>;

export type AIFlightSearchInput = z.infer<
  typeof aiFlightSearchSchema
>;

export const aiCompareFlightsSchema = z
  .object({
    origin: z.string().trim().length(3).toUpperCase(),
    destination: z.string().trim().length(3).toUpperCase(),
    departureDate: z.string().date(),
    passengers: z.coerce.number().int().min(1).max(9).default(1),
    travelClass: z
      .enum(["economy", "premium_economy", "business", "first"])
      .default("economy"),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  });

export type AICompareFlightsInput = z.infer<
  typeof aiCompareFlightsSchema
>;

export const smartBudgetSchema = z
  .object({
    origin: z.string().trim().min(2).max(100),
    destination: z.string().trim().min(2).max(100),
    durationDays: z.number().int().min(1).max(30),
    travellers: z.number().int().min(1).max(20).default(1),
    totalBudget: z.number().positive(),
    travelStyle: z
      .enum(["budget", "balanced", "luxury"])
      .default("balanced"),
    interests: z
      .array(z.string().trim().min(2).max(50))
      .max(10)
      .default([]),
  })
  .refine(
    (data) =>
      data.origin.toLowerCase() !== data.destination.toLowerCase(),
    {
      message: "Origin and destination must be different",
      path: ["destination"],
    }
  );

export type SmartBudgetInput = z.infer<typeof smartBudgetSchema>;
