import type{Request, Response, NextFunction} from "express";
import{getAllBookings,  getBookingById} from "./admin-bookings.service.js";
const bookingStatuses=["pending","confirmed","cancelled","completed"] as const;
const paymentStatuses=["pending","paid", "failed","refunded"] as const;

export const getBookings=async(
    req:Request,
    res:Response,
    next:NextFunction
): Promise<void>=>{
    try{
     const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    if(status && !bookingStatuses.includes(status as(typeof bookingStatuses)[number])){
        res.status(400).json({
            success:false,
            message:"incvalid booking status"
        });
        return;
    }
    if(paymentStatus&& !paymentStatuses.includes(paymentStatus as(typeof paymentStatuses)[number])){
        res.status(400).json({
            success:false,
            message:"invalid payemt status"
        });
        return;
    }
    const result = await getAllBookings({
      page,
      limit,
      status: status as (typeof bookingStatuses)[number] | undefined,
     paymentStatus:
        paymentStatus as (typeof paymentStatuses)[number] | undefined
    });

    res.status(200).json({
        success:true,
        message:"booking fetched successful",
        data:result
    });



    }catch(error){
        next(error);
    }
};
export const getBookingByDetails= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const bookingId= req.params.id;
        if(typeof bookingId !=="string"){
            res.status(400).json({
                sucess:false,
                message:"invalid booking id"
            });
            return;
        }
        const booking= await getBookingById(bookingId);
        if(!booking){
            res.status(404).json({
                success:false,
                message:"booking not found"
            });
            return;
        }
        res.status(200).json({
            success:true,
            message:"booking details fetched successfully",
            data:booking
        });
    }catch(error){
        next(error);
    }
};