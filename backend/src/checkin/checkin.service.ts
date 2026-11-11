
import { createHash, randomBytes } from "node:crypto";
import mongoose, { Types } from "mongoose";

import { Booking } from "../bookings/booking.model.js";
import { Flight } from "../flights/flight.model.js";
import { Passenger } from "../passengers/passenger.model.js";
import { CheckIn } from "./checkin.model.js";

const CHECK_IN_OPENS_HOURS = Number(
  process.env.CHECK_IN_OPENS_HOURS ?? 24
);

const CHECK_IN_CLOSES_HOURS = Number(
  process.env.CHECK_IN_CLOSES_HOURS ?? 2
);

function generateBoardingPassNumber(): string {
  return `SKY-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCheckInEligibility(
  bookingId: string,
  userId: Types.ObjectId
) {
  if (!mongoose.isValidObjectId(bookingId)) {
    throw new Error("INVALID_BOOKING_ID");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    userId,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status !== "confirmed") {
    throw new Error("BOOKING_NOT_CONFIRMED");
  }

  if (booking.paymentStatus !== "paid") {
    throw new Error("PAYMENT_NOT_COMPLETED");
  }

  const flight = await Flight.findById(booking.flight);

  if (!flight) {
    throw new Error("FLIGHT_NOT_FOUND");
  }

  if (
    !flight.isActive ||
    !["scheduled", "delayed"].includes(flight.status)
  ) {
    throw new Error("FLIGHT_NOT_AVAILABLE_FOR_CHECKIN");
  }

  const now = new Date();
  const departureTime = new Date(flight.departureTime);

  const opensAt = new Date(
    departureTime.getTime() -
      CHECK_IN_OPENS_HOURS * 60 * 60 * 1000
  );

  const closesAt = new Date(
    departureTime.getTime() -
      CHECK_IN_CLOSES_HOURS * 60 * 60 * 1000
  );

  if (now < opensAt) {
    throw new Error("CHECKIN_NOT_OPEN");
  }

  if (now > closesAt) {
    throw new Error("CHECKIN_CLOSED");
  }

  const seatAssignments = booking.seatAssignments ?? [];

  if (seatAssignments.length !== booking.totalPassengers) {
    throw new Error("SEAT_ASSIGNMENT_MISSING");
  }

  return {
    booking,
    flight,
    seatAssignments,
    opensAt,
    closesAt,
  };
}

export async function createCheckIn(
  bookingId: string,
  passengerId: string,
  userId: Types.ObjectId
) {
  if (
    !mongoose.isValidObjectId(bookingId) ||
    !mongoose.isValidObjectId(passengerId)
  ) {
    throw new Error("INVALID_ID");
  }

  const {
    booking,
    flight,
    seatAssignments,
  } = await getCheckInEligibility(bookingId, userId);

  const passengerObjectId = new Types.ObjectId(passengerId);

  const isBookingPassenger = booking.passengers.some(
    (id) => id.toString() === passengerObjectId.toString()
  );

  if (!isBookingPassenger) {
    throw new Error("PASSENGER_NOT_IN_BOOKING");
  }

  const passenger = await Passenger.findById(passengerObjectId);

  if (!passenger) {
    throw new Error("PASSENGER_NOT_FOUND");
  }

  const assignment = seatAssignments.find(
    (item) =>
      item.passenger.toString() === passengerObjectId.toString()
  );

  if (!assignment) {
    throw new Error("PASSENGER_SEAT_NOT_ASSIGNED");
  }

  const existingCheckIn = await CheckIn.findOne({
    booking: booking._id,
    passenger: passengerObjectId,
    status: "checked_in",
  });

  if (existingCheckIn) {
    throw new Error("ALREADY_CHECKED_IN");
  }

  const rawToken = randomBytes(32).toString("hex");
  const verificationTokenHash = hashVerificationToken(rawToken);

  const boardingPass = await CheckIn.create({
    booking: booking._id,
    flight: flight._id,
    passenger: passengerObjectId,
    userId,
    seatNumber: assignment.seatNumber,
    boardingPassNumber: generateBoardingPassNumber(),
    verificationTokenHash,
    checkedInAt: new Date(),
    status: "checked_in",
  });

  return {
    boardingPass: {
      id: boardingPass._id,
      boardingPassNumber: boardingPass.boardingPassNumber,
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      seatNumber: boardingPass.seatNumber,
      checkedInAt: boardingPass.checkedInAt,
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      bookingReference: booking.bookingReference,
    },
    verificationToken: rawToken,
  };
}
