import type{Request, Response, NextFunction} from "express";
import { getAllUsers, getUserById } from "./admin-users.service.js";
export const getUsers= async(
    req:Request,
    res:Response,
    next:NextFunction
): Promise<void>=>{
    try{
        const page= Number(req.query.page)||1;
        const limit= Number(req.query.limit)|| 10;

        const status = req.query.status;
    const search = req.query.search;
    if(
        status&&
        !["active","suspended","deleted"].includes(String(status))
    ){
        res.status(400).json({
            success:false,
            message:"invalid acc status"
        });
        return;
    }
    const result= await getAllUsers({
        page,limit,
         status: status as "active" | "suspended" | "deleted" | undefined,
      search: typeof search === "string" ? search : undefined
    });
    res.status(200).json({
        success:true,
        message:"user fethed successful",
        data:result
    });
    }catch(error){
        next(error);
    }
};
export const getUserDetails= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void> =>{
    try{
         const userId = req.params.id;

if (typeof userId !== "string") {
  res.status(400).json({
    success: false,
    message: "Invalid user ID"
  });
  return;
}

const user = await getUserById(userId);
        if(!user){
            res.status(404).json({
                success:false,
                message:"user not found"
            });
            return;
        }
        res.status(200).json({
            success:true,
            message:"user details fetched succeess",
            data:user
        });

    }catch(error){
        next(error);
    }

};