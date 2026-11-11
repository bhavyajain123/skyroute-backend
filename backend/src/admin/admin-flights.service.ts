
import { Flight } from "../flights/flight.model.js";

interface GetFlightOptions {
  page?: number;
  limit?: number;
  status?: "scheduled" | "delayed" | "cancelled" | "completed";
  search?: string;
}

export const getAllFlights = async (
  options: GetFlightOptions = {}
) => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 10));

  const filter: Record<string, unknown> = {};

  if (options.status) {
    filter.status = options.status;
  }

  if (options.search?.trim()) {
    filter.flightNumber = {
      $regex: options.search.trim(),
      $options: "i",
    };
  }

  const [flights, totalFlights] = await Promise.all([
    Flight.find(filter)
      .populate("airline", "name iataCode")
      .populate("departureAirport", "name iataCode city")
      .populate("arrivalAirport", "name iataCode city")
      .sort({ departureTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Flight.countDocuments(filter),
  ]);

  return {
    flights,
    pagination: {
      currentPage: page,
      limit,
      totalFlights,
      totalPages: Math.ceil(totalFlights / limit),
    },
  };
};

export const getFlightById = async (flightId: string) => {
  return Flight.findById(flightId)
    .populate("airline")
    .populate("departureAirport")
    .populate("arrivalAirport")
    .lean();
};
