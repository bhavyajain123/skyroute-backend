
import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBooking extends Document {
  bookingReference: string;
  userId?: Types.ObjectId;
  flight: Types.ObjectId;
  passengers: Types.ObjectId[];

  seatAssignments?: {
    passenger: Types.ObjectId;
    seatNumber: string;
  }[];

  contactEmail: string;
  contactPhone: string;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  totalPassengers: number;
  baseFare: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  currency: string;

  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    flight: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
      required: true
    },

    passengers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Passenger",
        required: true
      }
    ],

    seatAssignments: [
      {
        passenger: {
          type: Schema.Types.ObjectId,
          ref: "Passenger",
          required: true
        },
        seatNumber: {
          type: String,
          required: true,
          uppercase: true,
          trim: true
        }
      }
    ],

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true
    },

    cabinClass: {
      type: String,
      enum: ["economy", "premium_economy", "business", "first"],
      required: true
    },

    totalPassengers: {
      type: Number,
      required: true,
      min: 1
    },

    baseFare: {
      type: Number,
      required: true,
      min: 0
    },

    taxes: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    bookedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function () {

  if (
    this.baseFare !== undefined &&
    this.taxes !== undefined &&
    this.discount !== undefined
  ) {
    this.totalAmount = this.baseFare + this.taxes - this.discount;
  }

  if (
    this.passengers &&
    this.totalPassengers !== this.passengers.length
  ) {
    this.invalidate(
      "totalPassengers",
      "Total passengers must match passenger records"
    );
  }

  
  if (this.seatAssignments && this.seatAssignments.length > 0) {
    const seatNumbers = this.seatAssignments.map(
      (seat) => seat.seatNumber.toUpperCase()
    );

    const passengerIds = this.seatAssignments.map(
      (seat) => seat.passenger.toString()
    );

    
    if (new Set(seatNumbers).size !== seatNumbers.length) {
      this.invalidate(
        "seatAssignments",
        "A seat cannot be assigned to multiple passengers"
      );
    }

   
    if (new Set(passengerIds).size !== passengerIds.length) {
      this.invalidate(
        "seatAssignments",
        "A passenger cannot have multiple seats"
      );
    }

    if (this.seatAssignments.length !== this.totalPassengers) {
      this.invalidate(
        "seatAssignments",
        "Every passenger must have exactly one seat"
      );
    }

   
    const bookingPassengerIds = this.passengers.map(
      (id) => id.toString()
    );

    if (
      passengerIds.some((id) => !bookingPassengerIds.includes(id))
    ) {
      this.invalidate(
        "seatAssignments",
        "Seat assignment contains a passenger not in this booking"
      );
    }
  }
  if (
    this.discount !== undefined &&
    this.baseFare !== undefined &&
    this.taxes !== undefined &&
    this.discount > this.baseFare + this.taxes
  ) {
    this.invalidate(
      "discount",
      "Discount cannot exceed the booking subtotal"
    );
  }
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ flight: 1, status: 1 });

export const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);
