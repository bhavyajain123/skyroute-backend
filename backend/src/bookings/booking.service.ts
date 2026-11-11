
import mongoose, { Types } from "mongoose";
import { randomBytes } from "node:crypto";

import { Booking } from "./booking.model.js";
import { Passenger } from "../passengers/passenger.model.js";
import { Flight } from "../flights/flight.model.js";
import { FlightSeat } from "../flights/flight-seat.model.js";

import type { CreateBookingInput } from "./booking.validation.js";

export async function createBooking(
  input: CreateBookingInput,
  userId?: Types.ObjectId
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    
    if (!userId) {
      throw new Error("AUTH_REQUIRED_FOR_SEAT_SELECTION");
    }

    const passengerIds = input.passengerIds ?? [];
    const newPassengers = input.newPassengers ?? [];

    if (passengerIds.length > 0 && !userId) {
      throw new Error("AUTH_REQUIRED_FOR_SAVED_PASSENGERS");
    }

    let savedPassengerIds: Types.ObjectId[] = [];

    if (passengerIds.length > 0) {
      const savedPassengers = await Passenger.find({
        _id: { $in: passengerIds },
        userId,
      })
        .select("_id")
        .session(session)
        .lean();

      if (savedPassengers.length !== passengerIds.length) {
        throw new Error("INVALID_OR_UNAUTHORIZED_PASSENGER");
      }

      savedPassengerIds = savedPassengers.map(
        (passenger) => passenger._id
      );
    }

    let createdPassengerIds: Types.ObjectId[] = [];

    if (newPassengers.length > 0) {
      const passengerDocuments = await Passenger.create(
        newPassengers.map((passenger) => ({
          ...passenger,
          userId,
        })),
        { session }
      );

      createdPassengerIds = passengerDocuments.map(
        (passenger) => passenger._id
      );
    }

    const allPassengerIds = [
      ...savedPassengerIds,
      ...createdPassengerIds,
    ];

    const totalPassengers = allPassengerIds.length;

    if (totalPassengers < 1 || totalPassengers > 9) {
      throw new Error("INVALID_PASSENGER_COUNT");
    }

    if (input.seatNumbers.length !== totalPassengers) {
      throw new Error("SEAT_PASSENGER_COUNT_MISMATCH");
    }

   
    const flight = await Flight.findOne({
      _id: input.flightId,
      isActive: true,
      status: { $in: ["scheduled", "delayed"] },
      departureTime: { $gt: new Date() },
    }).session(session);

    if (!flight) {
      throw new Error("FLIGHT_NOT_AVAILABLE");
    }

    const selectedCabin = flight.cabinClasses.find(
      (cabin) => cabin.class === input.cabinClass
    );

    if (!selectedCabin) {
      throw new Error("CABIN_CLASS_NOT_AVAILABLE");
    }

    if (selectedCabin.availableSeats < totalPassengers) {
      throw new Error("NOT_ENOUGH_SEATS");
    }

   
    const selectedSeats = await FlightSeat.find({
      flight: flight._id,
      cabinClass: input.cabinClass,
      seatNumber: { $in: input.seatNumbers },
      status: "locked",
      lockedBy: userId,
      lockExpiresAt: { $gt: new Date() },
    }).session(session);

    if (selectedSeats.length !== input.seatNumbers.length) {
      throw new Error("SEAT_NOT_LOCKED_OR_EXPIRED");
    }

    const seatsByNumber = new Map(
      selectedSeats.map((seat) => [seat.seatNumber, seat])
    );

    
    const seatAssignments = allPassengerIds.map(
      (passengerId, index) => {
        const seatNumber = input.seatNumbers[index];
        const seat = seatsByNumber.get(seatNumber);

        if (!seat) {
          throw new Error("SELECTED_SEAT_NOT_FOUND");
        }

        return {
          passenger: passengerId,
          seatNumber,
        };
      }
    );

    const baseFare = selectedCabin.price * totalPassengers;
    const taxes = 0;
    const discount = 0;
    const totalAmount = baseFare + taxes - discount;

    


    const bookingReference = `SKY${randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

   
    const [booking] = await Booking.create(
      [
        {
          bookingReference,
          userId,
          flight: flight._id,
          passengers: allPassengerIds,
          seatAssignments,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          cabinClass: input.cabinClass,
          totalPassengers,
          baseFare,
          taxes,
          discount,
          totalAmount,
          currency: "INR",
          status: "pending",
          paymentStatus: "pending",
        },
      ],
      { session }
    );

  
    const seatUpdate = await FlightSeat.updateMany(
      {
        _id: { $in: selectedSeats.map((seat) => seat._id) },
        status: "locked",
        lockedBy: userId,
        lockExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          booking: booking._id,
        },
      },
      { session }
    );

    if (seatUpdate.modifiedCount !== input.seatNumbers.length) {
      throw new Error("SEAT_ASSIGNMENT_FAILED");
    }

    await session.commitTransaction();

    return booking;
  } catch (error: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
