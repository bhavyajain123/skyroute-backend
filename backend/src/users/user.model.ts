import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  firebaseUid?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: "user" | "admin" | "support";
  accountStatus: "active" | "suspended" | "deleted";
  isEmailVerified: boolean;
 passwordHash?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema= new Schema<IUser>(
    {
        firebaseUid:{

            type:String,
            sparse:true,
            unique:true,
            trim:true
        },
        firstName:  {

            type:String,

                required:true,
            trim:true,
            minlength: 2,
            maxlength:60
        },

        lastName: {
              type:String,
            required:true,
            trim:true,
            minlength: 2,
            maxlength:60
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            trim:true
        },
passwordHash: {
  type: String,
  required: false,
  select: false
},
        phone: {

             type:String,

            minlength: 7,

            maxlength: 20,
            trim:true
        }, 
        profileImage:{
            type:String,
            trim:true
        },
        role:{
            type:String,
            enum:["user", "admin", "support"],

            default:"user"
        },
         accountStatus : {

      type: String,
      enum:  ["active", "suspended", "deleted"],
      default:  "active"
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLoginAt:{
        type:Date
    }
    },{timestamps:true}
);
userSchema.index({ accountStatus:1});
export const User =  mongoose.model<IUser>(
    
    "User",
    userSchema
);