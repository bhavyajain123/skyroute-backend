import type {Request, Response} from "express";
import { getUserProfile, updateUserProfile } from "./user.service.js";

import { updateUserProfileSchema } from "./user.validation.js";
interface AuthenticatedRequest extends Request{
    user?: {
        id:string;
    };
}
export async function getUserProfileController(
    req:AuthenticatedRequest,
    res:Response
):Promise<void>{
    try{
        const userId= req.user?.id;

        if(!userId){
            res.status(401).json({
                success:false,
                message:"autehntication required",
            });
            return;
        }
        const user= await getUserProfile(userId);
        res.status(200).json({
            success:true,
            message:"user profile fetched successfuly",
            data:user,
        });

    }catch(error:unknown){
       const isNotFound= error instanceof Error && error.message=== "user_not_found";

        res.status(isNotFound ? 404:500).json({
            success:false,
            message: isNotFound
            ?"user not found"
            :"unbale to fetch profile",
          
        });
    }
}
export async function updateUserProfileController(
    req:AuthenticatedRequest,
    res:Response
):Promise<void>{
    try{
        const userId= req.user?.id;

        if(!userId){
            res.status(401).json({
                success:false,
                message:"authentication req,"
            });
            return;
        }
       const result= updateUserProfileSchema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                success:false,
                message:"invald profile details",
                errors:result.error.flatten(),
            });
            return;
        }
        const user= await updateUserProfile(userId, result.data);
        res.status(200).json({
            success:true,
            message:"profile updtaed successfully",
            data:user,
        });
    }catch(error:unknown){
        const isNotFound= error instanceof Error && error.message=== "user_not_found";
       

    res.status(isNotFound  ? 404 : 500).json({
      success: false,
        message: isNotFound
          ? "User not found."
          : "Unable to update profile.",
    });
  }
}