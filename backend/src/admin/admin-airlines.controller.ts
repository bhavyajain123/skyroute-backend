import type{Request, Response,NextFunction} from "express";
import { getAllAirlines, getAirlineById } from "./admin-airlines.service.js";
export const getAirlines = async (
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search;
    const active = req.query.isActive;
    if (
      active !== undefined &&
      active !== "true" &&
      active !== "false"
    ) {
      res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
      return;
    }
    const result= await getAllAirlines({
        page,limit,
        search: typeof search === "string" ? search : undefined,
      isActive:
        active === undefined ? undefined : active === "true"
    });
     res.status(200).json({
        success:true,
        message:"airlines fetched successfully",
        data:result
    });

    }catch(error){
        next(error);
    }
};
export const getAirlineDetails= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const airlineId= req.params.id;
        if(typeof airlineId !=="string"){
            res.status(400).json({
                success:false,
                message:"invalid airline id"
            });
            return;
        }
        const airline= await getAirlineById(airlineId);
        if(!airline){
            res.status(404).json({
                success:false,
                message:"airline not found"
            });
            return;
        }
        res.status(200).json({
            success:true,
            message:"airline details fetched successfully",
            data:airline
        });
    }catch(error){
        next(error);
    }
};