import PDFDocument from "pdfkit";
import {Booking} from "../bookings/booking.model.js";
import QRCode from "qrcode";
import { generateTicketVerificationToken } from "./ticket-verification.service.js";


export async function generateETicket(bookingReference: string){
  const reference= bookingReference.trim().toUpperCase();

    const booking= await Booking.findOne({
        bookingReference: bookingReference.trim().toUpperCase(),
        status:"confirmed",
        paymentStatus:"paid",

    })
    .populate({
        path:"flight",
        populate:[
            { path: "airline", select:"name iataCode" },
        { path: "departureAirport", select : "name iata city country iataCode" },
        { path:"arrivalAirport",select: "name iata city country iataCode" },
        ],
    })
    .populate({
        path:"passengers",
        select: "firstName lastName email phone dateOfBirth gender",

    });
    if(!booking){
        throw new Error("confirmed_booking_not_found");
    }
    const flight= booking.flight as any;
    const airline= flight?.airline;
    const departure= flight?.departureAirport;
    const arrival= flight?.arrivalAirport;
    const passengers= booking.passengers as any[];
    
    if(!flight|| !departure ||!arrival || !airline){
        throw new Error("ticket_flight_details_missing");
    }
    if(!passengers.length){
      throw new Error("tikcet_passenger_missing");
    }
      const backendUrl = process.env.BACKEND_URL;
      if(!backendUrl){
        throw new Error("backend_url is not configured");
      }
    const verificationToken= generateTicketVerificationToken(reference);

   const verificationUrl = `${process.env.BACKEND_URL}/api/tickets/verify/${reference}/verify?token=${verificationToken}`;

    const qrCodeDataUrl= await QRCode.toDataURL(verificationUrl,{
        errorCorrectionLevel:"H",
        width:180,
        margin:2,
    });
   
    const doc= new PDFDocument({
        size:"A4",
        margin:45,
       
    });

    const chunks: Buffer[]=[];
    return new Promise<{
        buffer:Buffer;
        fileName:string;
        bookingReference:string;
    }>((resolve, reject)=>{
        doc.on("data",(chunk:Buffer)=> chunks.push(chunk));

        doc.on("end",()=>{
            resolve({
               buffer: Buffer.concat(chunks),
        fileName: `SkyRoute-Ticket-${booking.bookingReference}.pdf`,
        bookingReference: reference, 
            });
        });
        doc.on("error", reject);

        try{
            doc.rect(0,0,595,105).fill("#102A43");

            doc
            .fillColor("#FFFFFF")
        .fontSize(25)
        .font("Helvetica-Bold")
        .text("SKYROUTE", 45, 30);

         doc
        .fontSize(10)
        .font("Helvetica")
        .text("E-TICKET / FLIGHT CONFIRMATION", 45, 65);

        doc.fillColor("#111827");
      doc.y = 130;

      doc.fontSize(10).font("Helvetica");
      doc.text(`PNR / Booking Reference: ${booking.bookingReference}`);
      doc.text(`Booking Date: ${booking.bookedAt.toLocaleString("en-IN")}`);
      doc.text(`Booking Status: ${booking.status.toUpperCase()}`);
      doc.text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`);
      doc.moveDown(1.5);

      doc.fontSize(15).font("Helvetica-Bold").text("Flight Information");
      doc.moveDown(0.7);
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text(`${airline.name}-${flight.flightNumber}`);
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica");
       doc.text(
        `From: ${departure.city}, ${departure.country} (${departure.iataCode})`
      );
      doc.text(
        `To: ${arrival.city}, ${arrival.country} (${arrival.iataCode})`
      );

      doc.moveDown(0.5);

      doc.text(
        `Departure: ${new Date(flight.departureTime).toLocaleString("en-IN")}`
      );
      doc.text(
        `Arrival: ${new Date(flight.arrivalTime).toLocaleString("en-IN")}`
      );
      doc.text(`Duration: ${flight.durationMinutes} minutes`);
      doc.text(`Cabin Class: ${booking.cabinClass.replace(/_/g, " ").toUpperCase()}`);
      doc.moveDown(1.5);
      doc.fontSize(15).font("Helvetica-Bold").text("passenger detail");
      doc.moveDown(0.7);

      passengers.forEach((passenger, index)=>{
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text(`Passenger ${index+1}`);

        doc.font("Helvetica");
        doc.text(
            `Name: ${passenger.firstName} ${passenger.lastName}`
        );
        doc.text(`Email: ${passenger.email}`);
        doc.text(`Phone: ${passenger.phone}`);
        doc.moveDown(0.7);

      });

      doc.moveDown(0.5);
      doc.fontSize(15).font("Helvetica-Bold").text("fare details");
      doc.moveDown(0.7);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Base fare:INR ${booking.baseFare.toFixed(2)}`);
       doc.text(`Taxes: INR ${booking.taxes.toFixed(2)}`);
      doc.text(`Discount: INR ${booking.discount.toFixed(2)}`);
      doc.moveDown(0.4);
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(`Total Paid: INR ${booking.totalAmount.toFixed(2)}`);

      doc.moveDown(2);

      doc.fontSize(9).font("Helvetica");
      doc.fillColor("#64748B");
      doc.text(
        "Please carry a valid government-issued photo ID during your journey.",
        { align: "center" }
      );

      doc.moveDown(0.5);
      doc.text(
        "This is a computer-generated e-ticket from SkyRoute.",
        { align: "center" }
      );

      doc.moveDown(1);
      doc.fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#102A43")
      .text("Ticket Verification QR", {align: "center"});
     
      doc.moveDown(0.5);

doc.fontSize(8)
  .font("Helvetica")
  .fillColor("#64748B")
  .text("Scan this QR code to verify your ticket.", {
    align: "center",
  });

      doc.end();
    } catch (error) {
      reject(error);

        }
    });
}