import {Types} from "mongoose";
import{Airline} from "./airline.model.js";
import type { CreateAirlineInput, UpdateAirlineInput } from "./airline.validation.js";

function validateAirlineId(airlineId: string){
    if(!Types.ObjectId.isValid(airlineId)){
        throw new Error("invalid_airline_id");
    }
}
function handleDuplicateError(error:unknown):never{
    if(
        typeof error ==="object"&&
        error!==null &&
        "code"in error &&
        error.code===11000
    ){
        throw new Error("airline_code_already_exists");
    }
    throw error;
}
export async function createAirline(input: CreateAirlineInput){
    try{
        const airline= await Airline.create(input);
        return airline;
    }catch(error: unknown){
        handleDuplicateError(error);
    }
}
export async function getAllAirlines(
    page=1,
    limit=10,
    search="",
    includeInactive= false
){
    const currentPage= Math.max(1, Math.floor(page));
    const pageLimit= Math.min(100, Math.max(1,Math.floor(limit)));
    const filter:Record<string, unknown>={};
    if(!includeInactive){
        filter.isActive= true;
    }
    if(search.trim()){
        const serachRegex= new RegExp(
            search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filter.$or=[
            {name: serachRegex},
            {iataCode: serachRegex},
            {icaoCode:serachRegex},
            {country:serachRegex},
        ];
    }
const [airlines, total] = await Promise.all([
  Airline.find(filter)
    .select("-__v")
    .sort({ name: 1 })
    .skip((currentPage - 1) * pageLimit)
    .limit(pageLimit),

  Airline.countDocuments(filter),
]);
    return {
        airlines,
        pagination:{
            total,
            page:currentPage,
            limit:pageLimit,
            totalPages:Math.ceil(total/pageLimit),
            hasNextPage: currentPage*pageLimit<total,
            hasPrevPage:currentPage>1,
        },
    };
}
export async function getAllAirlinesById(airlineId:string){
    validateAirlineId(airlineId);
    const airline= await Airline.findById(airlineId).select("-_v");

    if(!airline){
        throw new Error("airline_not_found");
    }
    return airline;
}
export async function updateAirline(
    airlineId:string,
    input:UpdateAirlineInput
){
    validateAirlineId(airlineId);

    try{
        const airline= await Airline.findByIdAndUpdate(
            airlineId,
            {$set:input},
            {
                new:true,
                runValidators:true,
            }
        ).select("-__v");
        if(!airline){
            throw new Error("airline_not_found");
        }
        return airline;
    }catch(error:unknown){
        if(
            error instanceof Error &&
            error.message=== "airline_not_found"
        ){
            throw error;
        }
        handleDuplicateError(error);
    }
}
export async function deleteAirline(airlineId: string){
    validateAirlineId(airlineId);

    const airline= await Airline.findByIdAndDelete(airlineId);

    if(!airline){
        throw new Error("airline_not_found");
    }
    return airline;
}