import type { Request, Response, NextFunction } from "express";
import { getAdminDashboardStats } from "./admin-dashboard.service.js";

export const getAdminDashboard=async(
    _req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const stats= await getAdminDashboardStats();
         res.status(200).json({
            success:true,
            message:"admin dashboard fetcged successfully",
            data:stats
        });
    }catch(error){
        next(error);
    }
};