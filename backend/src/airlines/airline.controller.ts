import type {Request,Response} from "express";

import {
  createAirline,
  getAllAirlines,
  getAllAirlinesById,
  updateAirline,
  deleteAirline,
} from "./airline.service.js";

import { createAirlineSchema,updateAirlineSchema, } from "./airline.validation.js";

export async function createAirlineController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const validation= createAirlineSchema.safeParse(req.body);
        if(!validation.success){
            res.status(400).json({
                success:false,
                message:"invalid airline data",
                errors:validation.error.issues,
            });
            return;
        }
        const airline= await createAirline(validation.data);
        res.status(201).json({
            success:true,
            message:"airline created successfully",
            data:airline,
        });

    }catch(error:unknown){
        const message= error instanceof Error?error.message:"";
        res.status(message=== "Airline_code_already_exists"?409:500).json({
            success:false,
            message:
            message==="airline code already exists"
            ?"airline code already exists"
            :"unavle tp create airline",
        });
    }
}
export async function getAllAirlinesController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const result = await getAllAirlines(page, limit, search);

    res.status(200).json({
      success: true,
      data: result.airlines,
      pagination: result.pagination,
    });
    }catch{
        res.status(500).json({
            success:false,
            message:"unable to fetch airlines",
        });
    }
}

export async function getAllAirlinesByIdController(
    req:Request,
    res:Response
):Promise<void>{
    try{
const airlineId= req.params.airlineId;

if(typeof airlineId !=="string"){
    res.status(400).json({
        success:false,
        message:"invalid airline id",
    });
    return;
}
const airline = await getAllAirlinesById(airlineId);
res.status(200).json({
    success:true,
    data:airline,
});
    }catch(error:unknown){
        const message= error instanceof Error? error.message :"";
        res.status(message=== "airline_not_found"? 404:400).json({
            success:false,
            message:
            message=== "airline_not_found"
            ?"airline not found"
            :"invalid airline id",
        });
    }
}
export async function updateAirlineController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const airlineId = req.params.airlineId;

    if (typeof airlineId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid airline ID.",
      });
      return;
    }

    const validation = updateAirlineSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid update data.",
        errors: validation.error.issues,
      });
      return;
    }

    const airline = await updateAirline(airlineId, validation.data);

    res.status(200).json({
      success: true,
      message: "Airline updated successfully.",
      data: airline,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    const status =
      message === "airline_not_found" ? 404 :
      message === "airline_code_already_exists" ? 409 : 400;

    res.status(status).json({
      success: false,
      message:
        message === "airline_not_found"
          ? "Airline not found."
          : message === "airline_code_already_exists"
            ? "Airline code already exists."
            : "Unable to update airline.",
    });
  }
}

export async function deleteAirlineController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const airlineId= req.params.airlineId;
        if(typeof airlineId !== "string"){
            res.status(400).json({
                success:false,
                message:"invalud airline id",
            });
            return;
        }
        await deleteAirline(airlineId);
        res.status(200).json({
            success:true,
            message:"airline deleted successfully",
        });
    }catch(error:unknown){
        const message= error instanceof Error ?error.message:"";
        res.status(message=== "airline_not_found" ?404:400).json({
            success:false,
            message: 
            message=== "airline_not_found"
            ?"airline not found"
            :"invaliud airline id",
        });
    }
}