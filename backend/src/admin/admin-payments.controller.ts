import type { Request, Response, NextFunction } from "express";
import { getAllPayments, getPaymentById } from "./admin-payments.service.js";
const paymentStatuses=["created","authorized","captured","failed", "refunded"] as const;
export const getPayments= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
         const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;

     if (
      status &&
      !paymentStatuses.includes(
        status as (typeof paymentStatuses)[number]
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
      return;
    }

    const result = await getAllPayments({
      page,
      limit,
      status: status as (typeof paymentStatuses)[number] | undefined
    });

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentDetails= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const paymentId= req.params.id;
          if (typeof paymentId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
      return;
    }
    const payment = await getPaymentById(paymentId);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
    


    