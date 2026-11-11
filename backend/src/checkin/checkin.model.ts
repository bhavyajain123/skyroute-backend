
import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

export interface ICheckIn extends Document {
  booking: Types.ObjectId;
  flight: Types.ObjectId;
  passenger: Types.ObjectId;
  userId: Types.ObjectId;
  seatNumber: string;
  boardingPassNumber: string;
  verificationTokenHash: string;
  checkedInAt: Date;
  status: "checked_in" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const checkInSchema = new Schema<ICheckIn>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking",required: true,  },

    flight: { type: Schema.Types.ObjectId,ref: "Flight",required: true,},
     
    passenger: { type: Schema.Types.ObjectId, ref: "Passenger", required: true,},
     
    userId: { type: Schema.Types.ObjectId,ref: "User",required: true, },

    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    boardingPassNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

verificationTokenHash: {
  type: String,
  required: true,
  unique: true,
  select: false,
},

    checkedInAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    status: {
      type: String,
      enum: ["checked_in", "cancelled"],
      default: "checked_in",
    },
  },
  {
    timestamps: true,
  }
);

checkInSchema.index(
  { booking: 1, passenger: 1 },
  { unique: true,
   
    partialFilterExpression: {
      status: "checked_in",
    },
  }
);

checkInSchema.index({userId: 1,createdAt: -1 });
checkInSchema.index({ flight: 1, seatNumber: 1 });

export const CheckIn = mongoose.model<ICheckIn>(
  "CheckIn",
  checkInSchema
);
