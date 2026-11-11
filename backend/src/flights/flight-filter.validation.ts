import mongoose from "mongoose";
import { z } from "zod";

export const flightFilterSchema = z
  .object({
    minPrice: z.coerce.number().min(0).optional(),

    maxPrice: z.coerce.number().min(0).optional(),

    airline: z.string().trim().refine((value)=>mongoose.Types.ObjectId.isValid(value),"invalud airline id").optional(),
    sortBy: z
      .enum([
        "price_asc",
        "price_desc",
        "departure_asc",
        "departure_desc",
        "duration_asc"
      ])
      .default("departure_asc"),

    departureTime: z
      .enum([
        "early_morning",
        "morning",
        "afternoon",
        "evening"
      ])
      .optional(),

       nonstop: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
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

export type FlightFilterInput = z.infer<typeof flightFilterSchema>;
