import type{Request, Response} from "express";
import { verifyTicket } from "./ticket-verification.service.js";

export async function verifyTicketController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const bookingReference= req.params.bookingReference;
        const token= req.query.token;

        if(
           typeof bookingReference !== "string" ||
      typeof token !== "string"  ||
      !bookingReference.trim() ||
      !token.trim()
        ){
            res.status(400).json({
                success:false,
                message:"booking reference and verification token required",
            });
            return;
        }
        const result= await verifyTicket(bookingReference, token);
        res.status(200).json({
            success:true,
            message:"ticket verified successfuly",
            data:result,
        });
    }catch(error:unknown){
       const isNotFound= error instanceof Error && error.message=== "ticket_not_Found";
        res.status(isNotFound? 404:400).json({
            success:false,
            message:isNotFound
            
            ?"ticket is inavalid or booking is not confrimed"
            :"ticket verification faiiled",
        });
    }
}