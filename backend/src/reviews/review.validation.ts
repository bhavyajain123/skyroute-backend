import{Types} from "mongoose";
import{z} from "zod";

const ObjectIdSchema=z
.string()
.trim()
.refine(
    (value)=> Types.ObjectId.isValid(value),
    "invalid mongodb id"
);
const ratingSchema= z.number().int().min(1).max(5);
const categoriesSchema=z
.object({
    cleanliness:ratingSchema.optional(),
    comfort:ratingSchema.optional(),
    staffService:ratingSchema.optional(),
    valueForMoney:ratingSchema.optional(),
})
.strict()
.refine(
    (data)=> Object.keys(data).length>0,
    "atleast one categories rating is required"
)
.optional();

export const createReviewSchema=z
.object({
    bookingId:ObjectIdSchema,
    rating:ratingSchema,
    title:z.string().trim().min(2).max(100).optional(),
    comment:z.string().trim().min(5).max(2000),
    categories:categoriesSchema,
})
.strict();

export const updateReviewSchema=z
.object({
    rating:ratingSchema.optional(),
    title:z.string().trim().min(2).max(100).optional(),
    comment:z.string().trim().min(5).max(2000).optional(),
    categories: categoriesSchema,
})
.strict()
.refine(
    (data)=>Object.keys(data).length>0,
    "at least one field is req for update"
);
export const reviewQuerySchema=z.object({
    page:z.coerce.number().int().min(1).default(1),
    limit:z.coerce.number().int().min(1).max(100).default(10),
    rating:ratingSchema.optional(),
    flightId:ObjectIdSchema.optional(),
    airlineId:ObjectIdSchema.optional(),
    sort :z
    .enum(["newest", "oldest","highest","lowest"])
    .default("newest"),
});


export type CreateReviewInput= z.infer<typeof createReviewSchema>;
export type UpdateReviewInput= z.infer<typeof updateReviewSchema>;
export type reviewQueryInput= z.infer<typeof reviewQuerySchema>;