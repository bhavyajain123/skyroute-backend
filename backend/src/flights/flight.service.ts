
import mongoose from "mongoose";

import { Flight } from "./flight.model.js";
import { Airport } from "../airports/airport.model.js";

import type { FlightSearchInput } from "./flight.validation.js";
import type { FlightFilterInput } from "./flight-filter.validation.js";

import { formatFlightResponse } from "./flight-response.service.js";

export const searchFlights = async (
  input: FlightSearchInput,
  filters?: FlightFilterInput
) => {
  const [originAirport, destinationAirport] = await Promise.all([
    Airport.findOne({
      iataCode: input.origin.toUpperCase(),
      isActive: true
    }).select("_id iataCode name city country timezone"),

    Airport.findOne({
      iataCode: input.destination.toUpperCase(),
      isActive: true
    }).select("_id iataCode name city country timezone")
  ]);

  const emptyResult = {
    flights: [],
    pagination: {
      page: input.page,
      limit: input.limit,
      total: 0,
      totalPages: 0
    }
  };

  if (!originAirport || !destinationAirport) {
    return emptyResult;
  }

  
  const timezone = originAirport.timezone || "UTC";

  const getLocalDateBoundary = (
    date: string,
    hour: number,
    minute = 0
  ): Date => {
    const [year, month, day] = date.split("-").map(Number);

    const target = new Date(
      Date.UTC(year, month - 1, day, hour, minute)
    );

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });

    const parts = formatter.formatToParts(target);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    const actualMinutes =
      Number(values.hour) * 60 + Number(values.minute);

    const expectedMinutes = hour * 60 + minute;

    return new Date(
      target.getTime() -
        (actualMinutes - expectedMinutes) * 60_000
    );
  };

const startDate = getLocalDateBoundary(input.departureDate, 0);

const [year, month, day] = input.departureDate.split("-").map(Number);

const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

const nextDateString = [
  nextDay.getUTCFullYear(),
  String(nextDay.getUTCMonth() + 1).padStart(2, "0"),
  String(nextDay.getUTCDate()).padStart(2, "0")
].join("-");

const endDate = getLocalDateBoundary(nextDateString, 0);
  const match: Record<string, unknown> = {
    departureAirport: originAirport._id,
    arrivalAirport: destinationAirport._id,
    departureTime: {
      $gte: startDate,
      $lt: endDate
    },
    status: { $in: ["scheduled", "delayed"] },
    isActive: true,
    cabinClasses: {
      $elemMatch: {
        class: input.travelClass,
        availableSeats: { $gte: input.passengers },
      },
    },
  };


  if (filters?.airline) {
    if (!mongoose.Types.ObjectId.isValid(filters.airline)) {
      throw new Error("INVALID_AIRLINE_ID");
    }

    match.airline = new mongoose.Types.ObjectId(filters.airline);
  }


  if (filters?.nonstop === true) {
    match.stops = 0;
  }

 
  if (
    filters?.minPrice !== undefined ||
    filters?.maxPrice !== undefined
  ) {
    const priceFilter: Record<string, number> = {};

    if (filters.minPrice !== undefined) {
      priceFilter.$gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      priceFilter.$lte = filters.maxPrice;
    }

    match.cabinClasses = {
      $elemMatch: {
        class: input.travelClass,
        availableSeats: { $gte: input.passengers },
        price: priceFilter
      }
    };
  }

  if (filters?.departureTime) {
    const timeRanges = {
      early_morning: [0, 6],
      morning: [6, 12],
      afternoon: [12, 18],
      evening: [18, 24]
    } as const;

    const [startHour, endHour] = timeRanges[filters.departureTime];

    const timeStart = getLocalDateBoundary(
      input.departureDate,
      startHour
    );

    const timeEnd = getLocalDateBoundary(
      input.departureDate,
      endHour
    );

    match.departureTime = {
      $gte: timeStart,
      $lt: timeEnd
    };
  }

  const sortBy = filters?.sortBy ?? "departure_asc";

  const sortStage: Record<string, 1 | -1> = {
    price_asc: { selectedPrice: 1, departureTime: 1 } as unknown as 1,
    price_desc: { selectedPrice: -1, departureTime: 1 } as unknown as -1,
    departure_asc: { departureTime: 1 } as unknown as 1,
    departure_desc: { departureTime: -1 } as unknown as -1,
    duration_asc: { durationMinutes: 1 } as unknown as 1
  };

  const sortDefinition: Record<string, 1 | -1> =
    sortBy === "price_asc"
      ? { selectedPrice: 1, departureTime: 1 }
      : sortBy === "price_desc"
        ? { selectedPrice: -1, departureTime: 1 }
        : sortBy === "departure_desc"
          ? { departureTime: -1 }
          : sortBy === "duration_asc"
            ? { durationMinutes: 1 }
            : { departureTime: 1 };

  const skip = (input.page - 1) * input.limit;

  const [result] = await Flight.aggregate([
    { $match: match },

    {
      $addFields: {
        selectedCabin: {
          $first: {
            $filter: {
              input: "$cabinClasses",
              as: "cabin",
              cond: {
                $eq: ["$$cabin.class", input.travelClass]
              }
            }
          }
        }
      }
    },

    {
      $addFields: {
        selectedPrice: "$selectedCabin.price"
      }
    },

    {
      $facet: {
        flights: [
          { $sort: sortDefinition },
          { $skip: skip },
          { $limit: input.limit },

          {
            $lookup: {
              from: "airlines",
              localField: "airline",
              foreignField: "_id",
              as: "airline"
            }
          },
          {
            $unwind: {
              path: "$airline",
              preserveNullAndEmptyArrays: true
            }
          },

          {
            $lookup: {
              from: "airports",
              localField: "departureAirport",
              foreignField: "_id",
              as: "departureAirport"
            }
          },
          {
            $unwind: {
              path: "$departureAirport",
              preserveNullAndEmptyArrays: true
            }
          },

          {
            $lookup: {
              from: "airports",
              localField: "arrivalAirport",
              foreignField: "_id",
              as: "arrivalAirport"
            }
          },
          {
            $unwind: {
              path: "$arrivalAirport",
              preserveNullAndEmptyArrays: true
            }
          }
        ],

        totalCount: [
          { $count: "total" }
        ]
      }
    }
  ]);

  const flights = (result?.flights ?? []).map((flight: any) =>
    formatFlightResponse(flight)
  );

  const total = result?.totalCount?.[0]?.total ?? 0;

  return {
    flights,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit)
    }
  };
};

export async function getAvailableRoutes() {
  const routes = await Flight.aggregate([
    {
      $match: {
        isActive: true,
        status: { $in: ["scheduled", "delayed"] },
        departureTime: { $gt: new Date() },
      },
    },
    {
      $unwind: "$cabinClasses",
    },
    {
      $match: {
        "cabinClasses.availableSeats": { $gt: 0 },
      },
    },
    {
      $group: {
        _id: {
          departureAirport: "$departureAirport",
          arrivalAirport: "$arrivalAirport",
          flightId: "$_id",
        },
        flightPrice: { $min: "$cabinClasses.price" },
        departureTime: { $first: "$departureTime" },
      },
    },
    {
      $group: {
        _id: {
          departureAirport: "$_id.departureAirport",
          arrivalAirport: "$_id.arrivalAirport",
        },
        minPrice: { $min: "$flightPrice" },
        flightCount: { $sum: 1 },
        nextDeparture: { $min: "$departureTime" },
      },
    },
    {
      $lookup: {
        from: "airports",
        localField: "_id.departureAirport",
        foreignField: "_id",
        as: "departureAirport",
      },
    },
    {
      $unwind: "$departureAirport",
    },
    {
      $lookup: {
        from: "airports",
        localField: "_id.arrivalAirport",
        foreignField: "_id",
        as: "arrivalAirport",
      },
    },
    {
      $unwind: "$arrivalAirport",
    },
    {
      $project: {
        _id: 0,
        departureAirport: {
          _id: "$departureAirport._id",
          name: "$departureAirport.name",
          city: "$departureAirport.city",
          iataCode: "$departureAirport.iataCode",
        },
        arrivalAirport: {
          _id: "$arrivalAirport._id",
          name: "$arrivalAirport.name",
          city: "$arrivalAirport.city",
          iataCode: "$arrivalAirport.iataCode",
        },
        minPrice: 1,
        flightCount: 1,
        nextDeparture: 1,
      },
    },
    {
      $sort: {
        nextDeparture: 1,
      },
    },
  ]);

  return routes;
}
