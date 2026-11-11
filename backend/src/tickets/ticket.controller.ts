import type {Request, Response} from "express";
import { generateETicket } from "./ticket.service.js";

export async function   downloadETicketController(
    req:Request,
    res:Response
): Promise<void>{
    try{
        const bookingReference= req.params.bookingReference;

        if(typeof bookingReference!== "string" ||!/^[A-Z0-9]{6,20}$/i.test(bookingReference)){
            res.status(400).json({
                success:false,
                message:"invalid booking reference",
            });
            return;
        }
        const ticket= await generateETicket(bookingReference);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Dispostion",
            `attachment; filename="${ticket.fileName}"`
        );
        res.setHeader("Content-Length", ticket.buffer.length);
        res.status(200).send(ticket.buffer);

    }catch(error:unknown){
        const isNotFound= error instanceof Error &&
        error.message=== "confirmed_booking_not_found";
        res.status(isNotFound?404:500).json({
            success:false,
            message:isNotFound
            ?"confrimed booking not found"
            :"unable to genearte e-ticket",
        });
    }
}