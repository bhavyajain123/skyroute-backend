import {z} from "zod";
const airlineFields={
    name:z.string().trim().min(2).max(1000),
    iataCode: z.string().trim()   .length(2, "IATA code must be exactly 2 characters.").regex(/^[A-Z0-9]{2}$/, "Invalid IATA code."),
    icaoCode:z.string()
    .trim()
    .toUpperCase()
        .length(3, "ICAO code must be exactly 3 characters.")
    .regex(/^[A-Z0-9]{3}$/, "Invalid ICAO code.")
    .optional(),

    country:z.string().trim().min(2).max(60),
    logo:z.string().trim().url("invalid logo url").optional(),
    website: z.string().trim().url("invalid webiste url").optional(),
    isActive: z.boolean().optional(),

};
export const createAirlineSchema= z.object({
    ...airlineFields,
}).strict();

export const updateAirlineSchema = z.object({
  name: airlineFields.name.optional(),
  iataCode: airlineFields.iataCode.optional(),
  icaoCode: airlineFields.icaoCode,
  country: airlineFields.country.optional(),
  logo: airlineFields.logo,
  website: airlineFields.website,
  isActive: airlineFields.isActive,
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required to update airline." }
);

export type CreateAirlineInput = z.infer<typeof createAirlineSchema>;
export type UpdateAirlineInput = z.infer<typeof updateAirlineSchema>;
