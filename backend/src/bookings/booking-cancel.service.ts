
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import { Booking } from "./booking.model.js";
import { Flight } from "../flights/flight.model.js";
import { Payment } from "../payments/payment.model.js";
import { createNotification } from "../notifications/notification.service.js";
import { FlightSeat } from "../flights/flight-seat.model.js";

export async function cancelBooking(
  bookingReference: string,
  userId: string
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("invalid_user_id");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({
        bookingReference: bookingReference.trim().toUpperCase(),
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      if (!booking) {
        throw new Error("booking_not_found");
      }

      if (booking.status === "cancelled") {
        throw new Error("booking_already_cancelled");
      }

      if (booking.status === "completed") {
        throw new Error("completed_booking_cant_be_cancelled");
      }

      let notificationType: "cancellation" | "refund" = "cancellation";
      let notificationTitle = "Booking Cancelled";
      let notificationMessage =
        `Your booking ${booking.bookingReference} has been cancelled successfully.`;

      
      if (booking.paymentStatus === "paid") {
        const payment = await Payment.findOne({
          booking: booking._id,
          userId: new mongoose.Types.ObjectId(userId),
          status: "captured",
        }).session(session);

        if (!payment) {
          throw new Error("captured_payment_not_found");
        }

        const refundId = `MOCK-REFUND-${randomBytes(6)
          .toString("hex")
          .toUpperCase()}`;

        payment.status = "refunded";
        payment.refundId = refundId;

        await payment.save({ session });

        booking.paymentStatus = "refunded";

        notificationType = "refund";
        notificationTitle = "Refund Initiated";
        notificationMessage =
          `Your refund of ${payment.currency} ${payment.amount} for booking ${booking.bookingReference} has been processed in mock mode. Refund ID: ${refundId}`;
      } else if (booking.paymentStatus === "refunded") {
        throw new Error("booking_already_refunded");
      }

     
     
if (booking.seatAssignments?.length) {
  // Release seats associated with this booking.
  const releasedSeats = await FlightSeat.updateMany(
    {
      flight: booking.flight,
      booking: booking._id,
      cabinClass: booking.cabinClass,
      status: { $in: ["booked", "locked"] }
    },
    {
      $set: {
        status: "available"
      },
      $unset: {
        lockedBy: 1,
        booking: 1,
        lockExpiresAt: 1
      }
    },
    { session }
  );

  if (releasedSeats.modifiedCount !== booking.seatAssignments.length) {
    throw new Error("BOOKING_SEAT_RELEASE_FAILED");
  }

  // Recalculate available seats from actual seat records.
  const availableSeats = await FlightSeat.countDocuments({
    flight: booking.flight,
    cabinClass: booking.cabinClass,
    status: "available"
  }).session(session);

  const flightUpdate = await Flight.updateOne(
    {
      _id: booking.flight,
      "cabinClasses.class": booking.cabinClass
    },
    {
      $set: {
        "cabinClasses.$.availableSeats": availableSeats
      }
    },
    { session }
  );

  if (flightUpdate.matchedCount === 0) {
    throw new Error("flight_or_cabin_not_found");
  }
} else {
  // Backward compatibility for older bookings without seat assignments.
  const flightUpdate = await Flight.updateOne(
    {
      _id: booking.flight,
      "cabinClasses.class": booking.cabinClass
    },
    [
      {
        $set: {
          cabinClasses: {
            $map: {
              input: "$cabinClasses",
              as: "cabin",
              in: {
                $cond: [
                  { $eq: ["$$cabin.class", booking.cabinClass] },
                  {
                    $mergeObjects: [
                      "$$cabin",
                      {
                        availableSeats: {
                          $min: [
                            "$$cabin.totalSeats",
                            {
                              $add: [
                                "$$cabin.availableSeats",
                                booking.totalPassengers
                              ]
                            }
                          ]
                        }
                      }
                    ]
                  },
                  "$$cabin"
                ]
              }
            }
          }
        }
      }
    ],
    { session }
  );

  if (flightUpdate.matchedCount === 0) {
    throw new Error("flight_or_cabin_not_found");
  }
}


    

      booking.status = "cancelled";
      await booking.save({ session });

    
      await createNotification(
        {
          userId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          relatedBooking: booking._id.toString(),
          relatedFlight: booking.flight.toString(),
        },
        session
      );
    });

    const cancelledBooking = await Booking.findOne({
      bookingReference: bookingReference.trim().toUpperCase(),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!cancelledBooking) {
      throw new Error("booking_not_found");
    }

    return cancelledBooking;
  } finally {
    await session.endSession();
  }
}
