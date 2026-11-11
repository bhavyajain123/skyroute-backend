import type{Request, Response,NextFunction} from "express";
import { getAllFlights,getFlightById } from "./admin-flights.service.js";
const flightStatuses=["scheduled","delayed","cancelled","completed"] as const;
export const getFlights= async(
    req:Request,
    res:Response,
    next:NextFunction
): Promise<void>=>{
    try{
        const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
 
   
       if (
      status &&
      !flightStatuses.includes(
        status as (typeof flightStatuses)[number]
      )
    ){res.status(400).json({
        success:false,
        mesage:"invalud flight status"
    });
    return;
        
    }
    const result= await getAllFlights({
        page,
        limit,
        status: status as (typeof flightStatuses)[number] | undefined,
      search: typeof search === "string" ? search : undefined
    });
    res.status(200).json({
        success:true,
        message:"flight fetched successful",
        data:result
    });
}catch(error){
    next(error);
}
};
export const getFlightDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flightId = req.params.id;

    if (typeof flightId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid flight ID"
      });
      return;
    }
    const flight = await getFlightById(flightId);

    if (!flight) {
      res.status(404).json({
        success: false,
        message: "Flight not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Flight details fetched successfully",
      data: flight
    });
  } catch (error) {
    next(error);
  }
};