
import mongoose, {
  Schema,
  type Document,
  type Types
} from "mongoose";

export interface IFlightSeat extends Document {
  flight: Types.ObjectId;
  seatNumber: string;

  cabinClass:
    | "economy"
    | "premium_economy"
    | "business"
    | "first";

  status: "available" | "locked" | "booked";

  lockedBy?: Types.ObjectId;
  booking?: Types.ObjectId;
  lockExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const flightSeatSchema = new Schema<IFlightSeat>(
  {
    flight: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
      required: true
    },

    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    cabinClass: {
      type: String,
      enum: [
        "economy",
        "premium_economy",
        "business",
        "first"
      ],
      required: true
    },

    status: {
      type: String,
      enum: ["available", "locked", "booked"],
      default: "available",
      required: true
    },

    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking"
    },

    lockExpiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);


flightSeatSchema.index(
  { flight: 1, seatNumber: 1 },
  { unique: true }
);

flightSeatSchema.index({
  flight: 1,
  cabinClass: 1,
  status: 1
});

export const FlightSeat = mongoose.model<IFlightSeat>(
  "FlightSeat",
  flightSeatSchema
);
