
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface BookingConfirmationEmail {
  to: string;
  passengerName: string;
  bookingReference: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  totalAmount: number;
  cabinClass: string;
}

export async function sendBookingConfirmationEmail(
  details: BookingConfirmationEmail
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to: details.to,
    subject: `Flight Booking Confirmed - ${details.bookingReference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#1f2937">
        <h2 style="color:#087f5b">Your flight is confirmed!</h2>
        <p>Hello ${details.passengerName},</p>
        <p>Your payment was successful and your flight booking is confirmed.</p>
        <hr/>
        <h3>Booking Details</h3>
        <p><b>Booking Reference:</b> ${details.bookingReference}</p>
        <p><b>Flight:</b> ${details.airline} - ${details.flightNumber}</p>
        <p><b>Route:</b> ${details.origin} to ${details.destination}</p>
        <p><b>Departure:</b> ${details.departureTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
        <p><b>Cabin:</b> ${details.cabinClass}</p>
        <p><b>Total Paid:</b> ₹${details.totalAmount.toLocaleString("en-IN")}</p>
        <hr/>
        <p>Thank you for choosing SkyRoute AI. Have a safe journey!</p>
        <p style="color:#6b7280;font-size:12px">This is an automated confirmation email.</p>
      </div>
    `,
  });
}
