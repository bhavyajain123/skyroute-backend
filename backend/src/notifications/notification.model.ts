import mongoose,{Schema, type Document, type Types} from "mongoose";
export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type:
    | "booking"
    | "payment"
    | "flight"
    | "cancellation"
    | "refund"
    | "system";
  relatedBooking?: Types.ObjectId;
  relatedFlight?: Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const notificationsSchema= new Schema<INotification>(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        title:{
            type:String,
            required:true,
            trim:true,
            maxlength:150
        },
        message:{
            type:String,
            required:true,
            trim:true,
            maxlength:1000
        },
          type: {
      type: String,
      enum: [
        "booking",
        "payment",
        "flight",
        "cancellation",
        "refund",
        "system"
      ],
      required: true
    },
    relatedBooking:{
        type:Schema.Types.ObjectId,
        ref:"Booking"
    },

relatedFlight:{
  type: Schema.Types.ObjectId,

    ref: "Flight"
},

    isRead: {
        type:Boolean,

          default:false
    },
    readAt:{
        type:Date

    }
    },{timestamps:true}
);

  notificationsSchema.index({ userId: 1, createdAt: -1 });
notificationsSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationsSchema
);