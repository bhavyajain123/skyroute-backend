import mongoose,{Schema, type Document} from"mongoose";

export interface IAirline extends Document{
    name:string;
    iataCode:string;
    icaoCode?:string;
    country:string;
    logo?:string;
    website?:string;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}
const AirlineSchema= new Schema<IAirline>(
    {name:{
        type:String,
        required:true,
        trim:true
    },
    iataCode:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true,
        minLength:2,
        maxlength:2
    },
    icaoCode:{
        type:String,
        uppercase:true,
        trim:true,
        minlength:3,
        maxlength:3
    },
    country:{
        type:String,
        required:true,
        trim:true
    },
    logo:{
        type:String,
        trim:true
    },
    website:{
        type:String,
        trim:true
    },
    isActive:{
        type:Boolean,
        default:true
    }



},{timestamps:true}
);
export const Airline= mongoose.model<IAirline>(
    "Airline", AirlineSchema
);