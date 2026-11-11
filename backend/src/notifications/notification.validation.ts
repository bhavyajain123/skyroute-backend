import {Types} from "mongoose";
import{z} from "zod";

const notificationTypes=["booking","payment","flight","cancellation","refund","system"] as const;

const ObjectIdSchema=z
.string()
.trim()
.refine(
    (value)=>Types.ObjectId.isValid(value),
    "invalid mongodb id"
);
export const createNotificationSchema=z
.object({
    userId: ObjectIdSchema,
    title:z.string().trim().min(1).max(150),
    message:z.string().trim().min(1).max(1000),
    type:z.enum(notificationTypes),
    relatedBooking:ObjectIdSchema.optional(),
    relatedFlight: ObjectIdSchema.optional(),
})
.strict();

export const notificationQuerySchema= z.object({
   page: z.coerce.number().int().min(1).max(100).default(1),
limit: z.coerce.number().int().min(1).max(100).default(10),

    isRead:z
    .enum(["true","false"])
    .transform((value)=> value ==="true")
    .optional(),

    type:z.enum(notificationTypes).optional(),
})
.strict();

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>;

export type NotificationQueryInput= z.infer<
typeof notificationQuerySchema
>;