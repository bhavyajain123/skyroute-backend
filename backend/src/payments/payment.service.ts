
import mongoose, { Types } from "mongoose";
import { randomBytes } from "node:crypto";
import { Booking } from "../bookings/booking.model.js";
import { Payment, type IPayment } from "./payment.model.js";
import { createNotification } from "../notifications/notification.service.js";
import { sendBookingConfirmationEmail } from "../integrations/email/email.service.js";


import type {  CreateMockPaymentInput,  MockPaymentResultInput,} from "./payment.validation.js";
import { FlightSeat } from "../flights/flight-seat.model.js";




function ensureMockPaymentEnabled(): void {
  if (
    process.env.MOCK_PAYMENTS_ENABLED !== "true" ||
    process.env.NODE_ENV === "production"
  ) {
  throw new Error("mock payments are disabled");
  }

}

function getObjectId(id: string, error: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id )) {

    throw new Error(error);
  }
  return new Types.ObjectId(id);
}


export async function createMockPayment(
  input: CreateMockPaymentInput,
  userId: string
): Promise<IPayment> {
  ensureMockPaymentEnabled();

  const userObjectId = getObjectId(userId, "invalid_user_id");
  const bookingObjectId = getObjectId(
    input.bookingId,
    "invalid_booking_id"
  );

  const session = await mongoose.startSession();
  let createdPayment: IPayment | null = null;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({
        _id: bookingObjectId,
        userId: userObjectId,
        status: "pending",
        paymentStatus: { $in: ["pending", "failed"] },
      }).session(session);

      if (!booking) {
        throw new Error("booking_not_found_or_payment_not_allowed");
      }

      if (
        !Number.isFinite(booking.totalAmount) ||
        booking.totalAmount < 1
      ) {
        throw new Error("invalid_booking_amount");
      }
      const existingPayment = await Payment.findOne({
        booking: booking._id,
        userId: userObjectId,
        status: "created",
      }).session(session);

      if (existingPayment) {
        createdPayment = existingPayment;
        return;
      }

      if (booking.paymentStatus === "failed") {
        booking.paymentStatus = "pending";
        await booking.save({ session });
      }

      const transactionId = `MOCK-${randomBytes(8)
        .toString("hex")
        .toUpperCase()}`;

      const [payment] = await Payment.create(
        [
          {
            booking: booking._id,
            userId: booking.userId,
            provider: "mock",
            transactionId,
            amount: booking.totalAmount,
            currency: booking.currency || "INR",
            method: input.method,
            status: "created",
          },
        ],
        { session }
      );

      createdPayment = payment;
    });

    if (!createdPayment) {
      throw new Error("unable_to_create_mock_payment");
    }

    return createdPayment;
  } finally {
    await session.endSession();
  }
}


export async function completeMockPayment(
  input: MockPaymentResultInput,
  userId: string
): Promise<IPayment> {
  ensureMockPaymentEnabled();

  const userObjectId = getObjectId(userId, "invalid_user_id");
  const paymentObjectId = getObjectId(
    input.paymentId,
    "invalid_payment_id"
  );

  const session = await mongoose.startSession();
  let completedPayment: IPayment | null = null;

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        _id: paymentObjectId,
        userId: userObjectId,
      }).session(session);

      if (!payment) {
        throw new Error("payment_not_found");
      }

      if (payment.status !== "created") {
        throw new Error("payment_already_processed");
      }

      const booking = await Booking.findOne({
        _id: payment.booking,
        userId: userObjectId,
        status: "pending",
        paymentStatus: "pending",
      }).session(session);

      if (!booking) {
        throw new Error("booking_not_eligible_for_payment");
      }

    
if (input.result === "success") {
  // Verify that all booking seats are still locked by this user.
  const seatUpdate = await FlightSeat.updateMany(
    {
      flight: booking.flight,
      booking: booking._id,
      cabinClass: booking.cabinClass,
      status: "locked",
      lockedBy: userObjectId,
      lockExpiresAt: { $gt: new Date() }
    },
    {
      $set: {
        status: "booked"
      },
      $unset: {
        lockedBy: 1,
        lockExpiresAt: 1
      }
    },
    { session }
  );

  if (seatUpdate.modifiedCount !== booking.totalPassengers) {
    throw new Error("BOOKING_SEATS_EXPIRED_OR_INVALID");
  }

  booking.paymentStatus = "paid";
  booking.status = "confirmed";

  payment.status = "captured";
  payment.paidAt = new Date();
} else {
  booking.paymentStatus = "failed";

  payment.status = "failed";
  payment.failureReason = "Mock payment declined.";
}

   

await booking.save({ session });
await payment.save({ session });

if (input.result === "success") {
  await createNotification(
    {
      userId: userObjectId.toString(),
      title: "Booking Confirmed!",
      message: "Your flight booking has been successfully confirmed. Have a great journey!",
      type: "booking",
      relatedBooking: booking._id.toString(),
      relatedFlight: booking.flight.toString(),
    },
    session
  );
}

completedPayment = payment;

    });

const paymentResult = completedPayment as IPayment | null;

if (!paymentResult) {
  throw new Error("unable_to_complete_mock_payment");
}


if (input.result === "success") {
  try {
    const bookingData = await Booking.findById(
      paymentResult.booking
    )
      .populate({
        path: "passengers",
        select: "firstName lastName",
      })
      .populate({
        path: "flight",
        select: "flightNumber departureTime",
        populate: [
          { path: "airline", select: "name iataCode" },
          { path: "departureAirport", select: "name city iataCode" },
          { path: "arrivalAirport", select: "name city iataCode" },
        ],
      })
      .lean() as unknown as {
        bookingReference: string;
        contactEmail: string;
        totalAmount: number;
        cabinClass: string;
        passengers: { firstName: string; lastName: string }[];
        flight: {
          flightNumber: string;
          departureTime: Date;
          airline: { name: string; iataCode: string };
          departureAirport: { name: string; city: string; iataCode: string };
          arrivalAirport: { name: string; city: string; iataCode: string };
        };
      } | null;

    if (bookingData?.flight) {
      const passengerName = bookingData.passengers
        .map((p) => `${p.firstName} ${p.lastName}`)
        .join(", ");

      await sendBookingConfirmationEmail({
        to: bookingData.contactEmail,
        passengerName,
        bookingReference: bookingData.bookingReference,
        flightNumber: bookingData.flight.flightNumber,
        airline: bookingData.flight.airline.name,
        origin: `${bookingData.flight.departureAirport.city} (${bookingData.flight.departureAirport.iataCode})`,
        destination: `${bookingData.flight.arrivalAirport.city} (${bookingData.flight.arrivalAirport.iataCode})`,
        departureTime: bookingData.flight.departureTime,
        totalAmount: bookingData.totalAmount,
        cabinClass: bookingData.cabinClass,
      });

      console.log("Booking confirmation email sent:", bookingData.bookingReference);
    }
  } catch (emailError) {
    console.error("Booking confirmation email failed:", emailError);
  }
}


    return paymentResult;

  }  finally {
    await session.endSession();

  }
  
}
