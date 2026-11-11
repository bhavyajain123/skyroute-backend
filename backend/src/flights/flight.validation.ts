import {z} from "zod";
export const flightSearchSchema= z
.object({
    origin:z.string().trim().length(3).toUpperCase(),
    destination: z.string().trim().length(3).toUpperCase(),
    departureDate: z.string().date(),
    returnDate:z.string().date().optional(),
    passengers:z.coerce.number().int().min(1).max(9).default(1),
    travelClass: z
    .enum(["economy", "premium_economy", "business", "first"])
      .default("economy"),

      page:z.coerce.number().int().min(1).default(1),
      limit:z.coerce.number().int().min(1).max(100).default(10)
})
.refine(
    (data)=>data.origin !== data.destination,
    {
        message:"origin and destination must be different",
        path:["destination"]
    }
)
.refine(
    (data)=>
        !data.returnDate || data.returnDate>= data.departureDate,
    {
        message:"return date must be after or equal departure time",
        path:["returnDate"]
    }
);
export type FlightSearchInput = z.infer<typeof flightSearchSchema>;


export const aiCompareFlightsSchema = z.object({
  origin: z.string().trim().length(3).toUpperCase(),

  destination: z.string().trim().length(3).toUpperCase(),

  departureDate: z.string().date(),

  passengers: z.coerce.number().int().min(1).max(9).default(1),

  travelClass: z
    .enum(["economy", "premium_economy", "business", "first"])
    .default("economy")
}).refine(
  (data) => data.origin !== data.destination,
  {
    message: "Origin and destination must be different",
    path: ["destination"]
  }
);

export type AICompareFlightsInput = z.infer<
  typeof aiCompareFlightsSchema
>;