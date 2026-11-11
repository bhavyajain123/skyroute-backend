
import { z } from "zod";

const passengerFields = {
  firstName: z.string().trim().min(2).max(50),

  lastName: z.string().trim().min(2).max(50),

  email: z
    .string()
    .trim()
    .email()
    .transform((value)   =>  value.toLowerCase()),
  phone: z.string().trim().min(7).max(20),
    dateOfBirth: z.coerce.date().refine(

     (value) =>value < new Date(),

    "Date of birth must be in the past"
  ),

  gender: z.enum(["male", "female", "other"]),
  passportNumber: z.string().trim().min(1).optional(),
  passportExpiry: z.coerce.date().optional(),
  nationality: z.string().trim().max(60).optional(),
};
 
export const createPassengerSchema = z
   .object(passengerFields)
    .strict()
    .refine(

    (data) => {
      if (data.passportExpiry && !data.passportNumber) {
        return false;
      }

      if (data.passportNumber && !data.passportExpiry) {
        return false;
      }

      if (data.passportExpiry && data.passportExpiry <= new Date()) {
        return false;
      }

      return true;
    },
    {
      message: "Valid passport number and future expiry date are required",
      path: ["passportExpiry"],
    }
  );



export const updatePassengerSchema = z
  .object({
    firstName: passengerFields.firstName.optional(),
    lastName: passengerFields.lastName.optional(),
    email: passengerFields.email.optional(),
    phone: passengerFields.phone.optional(),
    dateOfBirth: passengerFields.dateOfBirth.optional(),
    gender: passengerFields.gender.optional(),
    passportNumber: passengerFields.passportNumber.optional(),
    passportExpiry: passengerFields.passportExpiry.optional(),
    nationality: passengerFields.nationality.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one passenger field is required"
  )
  .refine(
    (data) =>
      !data.passportExpiry || data.passportExpiry > new Date(),
    {
      message: "Passport expiry must be a future date",
      path: ["passportExpiry"],
    }
  );

export type CreatePassengerInput = z.infer<
  typeof createPassengerSchema
>;

export type UpdatePassengerInput = z.infer<
  typeof updatePassengerSchema
>;
