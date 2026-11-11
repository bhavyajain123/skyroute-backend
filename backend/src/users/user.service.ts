import{Types} from "mongoose";
import{User} from "./user.model.js";
import type { UpdateUserProfileInput } from "./user.validation.js";

const USER_FIELDS = "-firebaseUid -__v";

function validateUserId(userId: string): void{
    if(!Types.ObjectId.isValid(userId)){
        throw new Error("invalid_user_id");
    }
}

export async function getUserProfile(userId:string){
   validateUserId(userId);
    const user= await User.findOne({
        _id:userId,
        accountStatus:"active",
    }).select(USER_FIELDS);
  
    if(!user){
        throw new Error("user_not_found");
    }
    return user;
}
export async function updateUserProfile(
    userId:string,
    input:UpdateUserProfileInput
){
    validateUserId(userId);
    const user= await User.findOneAndUpdate(
        {
            _id:userId,
            accountStatus:"active",
        },
        {
            $set:input,
        },{
            new:true,
            runValidators:true,
        }
    ).select(USER_FIELDS);

    if(!user){
        throw new Error("user_not_found");
    }
    return user;
}
export async function updateLastLogin(userId:string){
   validateUserId(userId);
    const user= await User.findOneAndUpdate(
        {
            _id:userId,
            accountStatus:"active",
        },{
            $set:{
                lastLoginAt:new Date(),
            },
        },
        {
            new:true,
        }
    ).select(USER_FIELDS);
    if(!user){
        throw new Error("user_not_found");
    }
    return user;
}