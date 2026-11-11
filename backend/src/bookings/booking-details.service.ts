
import { Booking } from "./booking.model.js";

export const getBookingByReference = async (
  bookingReference: string,
  userId: string
) => {
  const normalizedReference = bookingReference.trim().toUpperCase();

  const booking = await Booking.findOne({
    bookingReference: normalizedReference,
    userId,
  })
    .populate({
      path: "flight",
      populate: [
        { path: "airline" },
        { path: "departureAirport" },
        { path: "arrivalAirport" },
      ],
    })
    .populate({
      path: "passengers",
      select: "firstName lastName email phone dateOfBirth gender",
    })
    .lean();

  if (!booking) {
    throw new Error("booking_not_found");
  }

  return booking;
};
