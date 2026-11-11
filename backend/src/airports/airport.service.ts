
import { Types } from "mongoose";
import { Airport } from "./airport.model.js";

import type {
  CreateAirportInput,
  UpdateAirportInput,
  AirportSearchInput
} from "./airport.validation.js";


function validateAirportId(airportId: string): void {
  if (!/^[0-9a-fA-F]{24}$/.test(airportId)) {
    throw new Error("invalid_airport_id");
  }
}
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createAirport(input: CreateAirportInput) {
  const conditions = [
    { iataCode: input.iataCode },
    ...(input.icaoCode ? [{ icaoCode: input.icaoCode }] : [])
  ];

  const existingAirport = await Airport.findOne({
    $or: conditions
  });

  if (existingAirport) {
    if (existingAirport.iataCode === input.iataCode) {
      throw new Error("airport_iata_already_exists");
    }
    throw new Error("airport_icao_already_exists");
  }

  return Airport.create(input);
}

export async function getAirportById(airportId: string) {
  validateAirportId(airportId);

  const airport = await Airport.findById(airportId).select("-__v");
  if (!airport) {
    throw new Error("airport_not_found");
  }
  return airport;
}

export async function getAirportByIataCode(iataCode: string) {
  const airport = await Airport.findOne({
    iataCode: iataCode.trim().toUpperCase(),
    isActive: true
  }).select("-__v");
  if (!airport) {
    throw new Error("airport_not_found");
  }
  return airport;
}


export async function searchAirports(input: AirportSearchInput) {
   const { search, city, country, page, limit } = input;
  const filter: Record<string, unknown> = {
    isActive: true
  };

  if (city) {
    filter.city = {
      $regex: escapeRegex(city),
      $options: "i"
    };
  }

  if (country) {
    filter.country = {
      $regex: escapeRegex(country),
      $options: "i"
    };
  }

  if (search) {
    const searchRegex = escapeRegex(search);

    filter.$or = [
      { name: { $regex: searchRegex, $options: "i" } },
      { city: { $regex: searchRegex, $options: "i" } },
      { iataCode: { $regex: searchRegex, $options: "i" } },
      { icaoCode: { $regex: searchRegex, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  const [airports, total] = await Promise.all([
    Airport.find(filter)
      .select("-__v")
      .sort({ city: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Airport.countDocuments(filter)
  ]);

  return {
    airports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    }
  };
}

export async function updateAirport(
  airportId: string,
  input: UpdateAirportInput
) {
  validateAirportId(airportId);

  const airport = await Airport.findById(airportId);

  if (!airport) {
    throw new Error("airport_not_found");
  }

  if (input.iataCode || input.icaoCode) {
    const conditions = [
      ...(input.iataCode ? [{ iataCode: input.iataCode }] : []),
      ...(input.icaoCode ? [{ icaoCode: input.icaoCode }] : [])
    ];

    const duplicate = await Airport.findOne({
      _id: { $ne: airportId },
      $or: conditions
    });

    if (duplicate) {
      if (input.iataCode && duplicate.iataCode === input.iataCode) {
        throw new Error("airport_iata_already_exists");
      }

      throw new Error("airport_icao_already_exists");
    }
  }

  Object.assign(airport, input);

  await airport.save();

  return airport;
}


export async function deleteAirport(airportId: string) {
  validateAirportId(airportId);

  const airport = await Airport.findById(airportId);

  if (!airport) {
    throw new Error("airport_not_found");
  }

  airport.isActive = false;
  await airport.save();
  return airport;
}
