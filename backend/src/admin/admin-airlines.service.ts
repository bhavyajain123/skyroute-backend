import {Airline} from "../airlines/airline.model.js";
interface GetAirlinesOoptions{
    page?: number;
    limit?:number;
    search?:string;
    isActive?:boolean;
}
export const getAllAirlines= async(
    options: GetAirlinesOoptions={}
)=>{
    const page= Math.max(1,options.page?? 1);
    const limit= Math.min(100, Math.max(1,options.limit??10));
    const filter: Record<string,unknown>={};

    if(typeof options.isActive==="boolean"){
        filter.isActive= options.isActive;
    }
    if(options.search?.trim()){
        const search= options.search.trim();
        filter.$or=[{name:{$regex:search, $options:"i"}},{iataCode:{$regex:search, $options:"i"}},{country:{$regex:search,$options:"i"}}];
    }
    const[airlines, totalAirlines]= await Promise.all([
        Airline.find(filter)
        .sort({name:1})
        .skip((page-1)*limit)
        .limit(limit)
        .lean(),
        Airline.countDocuments(filter)
        
    ]);
    return{airlines, pagination:{currentPage:page, limit, totalAirlines, totalPages:Math.ceil(totalAirlines/limit)}};
};
export const getAirlineById = async (airlineId: string) => {
  return Airline.findById(airlineId).lean();
};