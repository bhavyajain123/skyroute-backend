import mongoose, {Schema, type Document, type Types} from "mongoose";
export interface IPassenger extends Document {
  userId?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  passportNumber?: string;
  passportExpiry?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
}
const passengerSchema= new Schema<IPassenger>(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        firstName:{
            type:String,
            required:true,
            trim:true,
            minlength: 2,
      maxlength: 50
            
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
            minlength: 2,
      maxlength: 50
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
          match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phone:{
            type:String,
            required:true,
            trim:true,
            minlength: 7,
            maxlength: 20
        },
        dateOfBirth:{
            type:Date,
            required:true,
            validate: {
        validator: (value: Date) => value < new Date(),
        message: "Date of birth must be in the past"
      }
        },
        gender:{
            type:String,
            enum:["male","female","other"],
            required:true
        },
        passportNumber:{
            type:String,
            uppercase:true,
            trim:true
        },
    passportExpiry: {
  type: Date,
  validate: {
    validator: function (this: IPassenger, value?: Date) {
      if (value && !this.passportNumber) return false;
      if (!value || !this.passportNumber) return true;
      return value > new Date();
    },
    message: "Passport number is required and passport must not be expired."
  }
},
        nationality:{
            type:String,
            trim:true
        }
    },{timestamps:true}
);

passengerSchema.index({userId:1});
passengerSchema.index({email:1});
export const Passenger= mongoose.model<IPassenger>(
    "Passenger",
    passengerSchema
);