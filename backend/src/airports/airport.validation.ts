
import { z } from "zod";

const airportFields = {
  name: z.string().trim().min(2).max(100),

  iataCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "IATA code must contain exactly 3 letters"),

  icaoCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}$/, "ICAO code must contain exactly 4 letters")
    .optional(),

  city: z.string().trim().min(2).max(100),

  country: z.string().trim().min(2).max(100),

  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Country code must contain exactly 2 letters"),

  timezone: z.string().trim().min(1).optional(),

  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    })
    .strict()
    .optional(),

  isActive: z.boolean().optional()
};


export const createAirportSchema = z
  .object(airportFields)
  .strict();

export const updateAirportSchema = z
  .object({
    name: airportFields.name.optional(),
    iataCode: airportFields.iataCode.optional(),
    icaoCode: airportFields.icaoCode,
    city: airportFields.city.optional(),
    country: airportFields.country.optional(),
    countryCode: airportFields.countryCode.optional(),
    timezone: airportFields.timezone,
    coordinates: airportFields.coordinates,
    isActive: airportFields.isActive
  })
  .strict()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required for update"
  );

export const airportSearchSchema = z.object({
  search: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

export type CreateAirportInput = z.infer<
  typeof createAirportSchema
>;
export type UpdateAirportInput = z.infer<
  typeof updateAirportSchema
>;
export type AirportSearchInput = z.infer<
  typeof airportSearchSchema
>;
