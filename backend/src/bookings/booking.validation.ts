
import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

const passengerSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().email().max(100),
    phone: z.string().trim().min(7).max(20),

    dateOfBirth: z.coerce.date().refine(
      (date) => date < new Date(),
      "Date of birth must be in the past"
    ),

    gender: z.enum(["male", "female", "other"]),

    passportNumber: z.string().trim().min(5).max(20).optional(),
    passportExpiry: z.coerce.date().optional(),
    nationality: z.string().trim().max(60).optional()
  })
  .refine(
    (data) =>
      Boolean(data.passportNumber) === Boolean(data.passportExpiry),
    {
      message: "Passport number and expiry date must be provided together",
      path: ["passportExpiry"]
    }
  )
  .refine(
    (data) => {
      if (!data.passportExpiry) {
        return true;
      }

      return data.passportExpiry > new Date();
    },
    {
      message: "Passport must not be expired",
      path: ["passportExpiry"]
    }
  );

export const createBookingSchema = z
  .object({
    flightId: objectIdSchema,

    passengerIds: z.array(objectIdSchema).max(9).optional(),

    newPassengers: z.array(passengerSchema).max(9).optional(),

    contactEmail: z.string().trim().email().max(100),

    contactPhone: z.string().trim().min(7).max(20),

    cabinClass: z.enum([
      "economy",
      "premium_economy",
      "business",
      "first"
    ]),

    seatNumbers: z
      .array(
        z.string()
          .trim()
          .toUpperCase()
          .regex(/^[0-9]{1,3}[A-F]$/, "Invalid seat number")
      )
      .min(1)
      .max(9)
  })
  .refine(
    (data) => {
      const savedCount = data.passengerIds?.length ?? 0;
      const newCount = data.newPassengers?.length ?? 0;
      const totalPassengers = savedCount + newCount;

      return totalPassengers >= 1 && totalPassengers <= 9;
    },
    {
      message: "Select between 1 and 9 passengers",
      path: ["passengerIds"]
    }
  )
  .refine(
    (data) => {
      const ids = data.passengerIds ?? [];
      return new Set(ids).size === ids.length;
    },
    {
      message: "Duplicate passenger IDs are not allowed",
      path: ["passengerIds"]
    }
  )
  .refine(
    (data) => {
      const savedCount = data.passengerIds?.length ?? 0;
      const newCount = data.newPassengers?.length ?? 0;
      return data.seatNumbers.length === savedCount + newCount;
    },
    {
      message: "Select exactly one seat for each passenger",
      path: ["seatNumbers"]
    }
  )
  .refine(
    (data) => new Set(data.seatNumbers).size === data.seatNumbers.length,
    {
      message: "Duplicate seat numbers are not allowed",
      path: ["seatNumbers"]
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
