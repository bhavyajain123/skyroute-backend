import mongoose,{Schema, type Document, type Types} from "mongoose";
export interface IAdminStats extends Document {
  date: Date;
  totalUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalRefunds: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
const adminStatsSchema= new Schema<IAdminStats>(
    {
        date:{
            type:Date,
            required:true
        },
        totalUsers:{
            type:Number,
            default:0,
            min:0
        },
        totalBookings:{
            type:Number,
            default:0,
            min:0
        },
        cancelledBookings:{
            type:Number,
            default:0,
            min:0
        },
        totalRevenue:{
            type:Number,
            default:0,
            min:0
        },
        totalRefunds:{
            type:Number,
            default:0,
            min:0
        },
        currency:{
            type:String,
            default:"INR",
            uppercase:true
        }
    },{timestamps:true}
);
adminStatsSchema.index({date:1},{unique:true});
export const AdminStats= mongoose.model<IAdminStats>(
    "AdminStats",
    adminStatsSchema
);