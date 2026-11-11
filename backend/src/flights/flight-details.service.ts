
import mongoose from "mongoose";
import { Flight } from "./flight.model.js";
import { formatFlightResponse } from "./flight-response.service.js";

export const getFlightById = async (flightId: string) => {
  if (!mongoose.Types.ObjectId.isValid(flightId)) {
    throw new Error("INVALID_FLIGHT_ID");
  }

  const flight = await Flight.findOne({
    _id: flightId,
    isActive: true
  })
    .populate("airline")
    .populate("departureAirport")
    .populate("arrivalAirport")
    .lean();

  if (!flight) {
    throw new Error("FLIGHT_NOT_FOUND");
  }

  return formatFlightResponse(flight);
};
