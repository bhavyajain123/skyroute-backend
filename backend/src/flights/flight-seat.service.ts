
import mongoose from "mongoose";
import { Flight } from "./flight.model.js";
import { FlightSeat } from "./flight-seat.model.js";

const SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"];

function generateSeatNumbers(
  startIndex: number,
  totalSeats: number
): string[] {
  const seats: string[] = [];

  for (let i = 0; i < totalSeats; i++) {
    const index = startIndex + i;
    const row = Math.floor(index / 6) + 1;
    const column = SEAT_COLUMNS[index % 6];

    seats.push(`${row}${column}`);
  }

  return seats;
}

export async function getFlightSeatMap(
  flightId: string,
  cabinClass: string
) {
  if (!mongoose.isValidObjectId(flightId)) {
    throw new Error("INVALID_FLIGHT_ID");
  }

  const flight = await Flight.findById(flightId).lean();

  if (!flight || !flight.isActive) {
    throw new Error("FLIGHT_NOT_FOUND");
  }

  const cabinIndex = flight.cabinClasses.findIndex(
    (cabin) => cabin.class === cabinClass
  );

  if (cabinIndex === -1) {
    throw new Error("CABIN_CLASS_NOT_AVAILABLE");
  }

  const selectedCabin = flight.cabinClasses[cabinIndex];

  
  const existingSeats = await FlightSeat.countDocuments({
    flight: flight._id
  });

  if (existingSeats === 0) {
    let startIndex = 0;

    for (const cabin of flight.cabinClasses) {
      const seatNumbers = generateSeatNumbers(
        startIndex,
        cabin.totalSeats
      );

      if (seatNumbers.length > 0) {
        await FlightSeat.insertMany(
          seatNumbers.map((seatNumber) => ({
            flight: flight._id,
            seatNumber,
            cabinClass: cabin.class,
            status: "available"
          }))
        );
      }

      startIndex += cabin.totalSeats;
    }
  }

 
  await FlightSeat.updateMany(
    {
      flight: flight._id,
      status: "locked",
      lockExpiresAt: { $lte: new Date() }
    },
    {
      $set: { status: "available" },
      $unset: {
        lockedBy: 1,
        booking: 1,
        lockExpiresAt: 1
      }
    }
    
  );

  
  const seatCounts = await FlightSeat.aggregate([
    {
      $match: {
        flight: flight._id
      }
    },
    {
      $group: {
        _id: "$cabinClass",
        availableSeats: {
          $sum: {
            $cond: [
              { $eq: ["$status", "available"] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const availabilityMap = new Map(
    seatCounts.map((item) => [
      item._id,
      item.availableSeats
    ])
  );

  const flightDocument = await Flight.findById(flight._id);

  if (flightDocument) {
    flightDocument.cabinClasses.forEach((cabin) => {
      cabin.availableSeats =
        availabilityMap.get(cabin.class) ?? 0;
    });

    await flightDocument.save();
  }


const seats = await FlightSeat.find({
  flight: flight._id,
  cabinClass: selectedCabin.class
})
  .select("seatNumber cabinClass status lockExpiresAt")
  .lean();

seats.sort((a, b) => {
  const rowA = parseInt(a.seatNumber, 10);
  const rowB = parseInt(b.seatNumber, 10);

  if (rowA !== rowB) {
    return rowA - rowB;
  }

  const columnA = a.seatNumber.replace(/[0-9]/g, "");
  const columnB = b.seatNumber.replace(/[0-9]/g, "");

  return columnA.localeCompare(columnB);
});
const syncedAvailableSeats =
  availabilityMap.get(selectedCabin.class) ?? 0;

  return {
    flightId: flight._id,
    flightNumber: flight.flightNumber,
    cabinClass: selectedCabin.class,
    totalSeats: selectedCabin.totalSeats,
    availableSeats: syncedAvailableSeats,
    seats
  };
}

export async function lockFlightSeats(
  flightId: string,
  cabinClass: string,
  seatNumbers: string[],
  userId: string
) {
  if (!mongoose.isValidObjectId(flightId)) {
    throw new Error("INVALID_FLIGHT_ID");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("INVALID_USER_ID");
  }

  const normalizedSeats = seatNumbers.map((seat) =>
    seat.trim().toUpperCase()
  );

  if (
    normalizedSeats.length < 1 ||
    normalizedSeats.length > 9 ||
    new Set(normalizedSeats).size !== normalizedSeats.length
  ) {
    throw new Error("INVALID_SEAT_SELECTION");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const flight = await Flight.findOne({
      _id: flightId,
      isActive: true,
      status: { $in: ["scheduled", "delayed"] },
      departureTime: { $gt: new Date() }
    }).session(session);

    if (!flight) {
      throw new Error("FLIGHT_NOT_AVAILABLE");
    }

    const cabin = flight.cabinClasses.find(
      (item) => item.class === cabinClass
    );

    if (!cabin) {
      throw new Error("CABIN_CLASS_NOT_AVAILABLE");
    }

    // Release expired locks before locking new seats.
    await FlightSeat.updateMany(
      {
        flight: flight._id,
        cabinClass,
        status: "locked",
        lockExpiresAt: { $lte: new Date() }
      },
      {
        $set: { status: "available" },
        $unset: {
          lockedBy: 1,
          booking: 1,
          lockExpiresAt: 1
        }
      },
      { session }
    );

    // Atomically lock each selected seat.
    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const lockedSeats = [];

    for (const seatNumber of normalizedSeats) {
      const seat = await FlightSeat.findOneAndUpdate(
        {
          flight: flight._id,
          cabinClass,
          seatNumber,
          status: "available"
        },
        {
          $set: {
            status: "locked",
            lockedBy: new mongoose.Types.ObjectId(userId),
            lockExpiresAt: lockExpiry
          }
        },
        {
          new: true,
          session
        }
      );

      if (!seat) {
        throw new Error("SEAT_NOT_AVAILABLE");
      }

      lockedSeats.push(seat);
    }

    // Keep flight inventory synchronized with available seat records.
    const availableCount = await FlightSeat.countDocuments({
      flight: flight._id,
      cabinClass,
      status: "available"
    }).session(session);

    const inventoryUpdate = await Flight.updateOne(
      {
        _id: flight._id,
        "cabinClasses.class": cabinClass
      },
      {
        $set: {
          "cabinClasses.$.availableSeats": availableCount
        }
      },
      { session }
    );

    if (inventoryUpdate.modifiedCount !== 1) {
      throw new Error("INVENTORY_UPDATE_FAILED");
    }

    await session.commitTransaction();

    return {
      flightId: flight._id,
      cabinClass,
      lockedSeats: lockedSeats.map((seat) => seat.seatNumber),
      expiresAt: lockExpiry
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
