
import { Types } from "mongoose";
import { Booking } from "./booking.model.js";

interface MyBookingsOptions {
  page?: number;
  limit?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
}

export async function getMyBookings(
  userId: string,
  options: MyBookingsOptions = {}
) {
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    throw new Error("invalid_user_id");
  }
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const filter:{

    userId: Types.ObjectId;
    status?: MyBookingsOptions["status"];
  } = {
    userId: new Types.ObjectId(userId)
  };

  if (options.status) {
    filter.status = options.status;
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate({
        path: "flight",
        populate: [
          { path: "airline", select: "name iataCode logo" },
          {
            path: "departureAirport",
            select: "name iataCode city country"
          },
          {
            path: "arrivalAirport",
            select: "name iataCode city country"
          }
        ]
      })
      .populate({
        path: "passengers",
        select: "firstName lastName email phone"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments(filter)
  ]);

  return { bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
