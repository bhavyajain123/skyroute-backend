
import { Types } from "mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => Types.ObjectId.isValid(value),
    "Invalid MongoDB ID"
  );

export const createMockPaymentSchema = z
  .object({
    bookingId: objectIdSchema,

    method: z.enum([
      "card",
      "upi",
      "netbanking",
      "wallet",
      "cash",
    ]),
  })
  .strict();

export const mockPaymentResultSchema = z
  .object({
    paymentId: objectIdSchema,

    result: z.enum(["success", "failed"]),
  })
  .strict();

export type CreateMockPaymentInput = z.infer<
  typeof createMockPaymentSchema
>;

export type MockPaymentResultInput = z.infer<
  typeof mockPaymentResultSchema
>;
