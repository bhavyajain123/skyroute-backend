import {  createHmac, timingSafeEqual} from "node:crypto";
import {Booking} from "../bookings/booking.model.js"

function getTicketSecret(): string{
    const secret= process.env.TICKET_QR_SECRET;

    if(!secret || secret.length<32){
        throw new Error("TICKET_QR_SECRET must be at least 32 chars");
    }
    return secret;
}
export function generateTicketVerificationToken(
    bookingReference: string
):string{
    const reference= bookingReference.trim().toUpperCase();
    return createHmac("sha256", getTicketSecret())
    .update(reference)
    .digest("hex");
}
export async function verifyTicket(
    bookingReference: string,
    token: string
){
    const reference= bookingReference.trim().toUpperCase();
    if(!/^[A-Z0-9]{6,20}$/.test(reference)) {
    throw new Error("invalid_ticket_reference");
  }

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    throw new Error("invalid_ticket_token");
  }
  const expectedToken= generateTicketVerificationToken(reference);
  const suppliedBuffer= Buffer.from(token,"hex");
  const expectedBuffer= Buffer.from(expectedToken, "hex");

  if(suppliedBuffer.length!== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ){
    throw new Error("invalid_ticket_token");
  }
  const booking = await Booking.findOne({
    bookingReference: reference,
    status: "confirmed",
    paymentStatus: "paid",
  }).populate({
    path: "flight",
    populate: [
      { path: "airline", select: "name" },
      { path: "departureAirport", select: "city iataCode" },
      { path: "arrivalAirport", select: "city iataCode" },
    ],
  });
if(!booking){
    throw new Error("ticket_not_valid");
}
const flight= booking.flight as any;
if(!flight){
  throw new Error("flight_not_found");
}
return{
    valid: true,
    bookingReference: booking.bookingReference,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    flight: {
      airline  : flight?.airline?.name,
      flightNumber  :flight?.flightNumber,
        departure : flight?.departureAirport?.city,
       departureCode: flight?.departureAirport?.iataCode,
          arrival: flight ?. arrivalAirport?.city,
      arrivalCode: flight?.  arrivalAirport?.iataCode,
      departureTime : flight ?.departureTime,
      arrivalTime: flight?.arrivalTime,
},

};
}