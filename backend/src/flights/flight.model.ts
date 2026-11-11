
import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

export interface IFlight extends Document {
  flightNumber: string;
  airline: Types.ObjectId;
  departureAirport: Types.ObjectId;
  arrivalAirport: Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  aircraft?: string;
  stops: number;

  cabinClasses: {
    class: "economy" | "premium_economy" | "business" | "first";
    totalSeats: number;
    availableSeats: number;
    price: number;

    baggage: {
      cabinBaggageKg: number;
      checkInBaggageKg: number;
    };

    farePolicy: {
      refundable: boolean;
      freeCancellation: boolean;
      cancellationFee: number;
      freeSeatSelection: boolean;
      mealIncluded: boolean;
    };
  }[];

  status: "scheduled" | "delayed" | "cancelled" | "completed";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const flightSchema = new Schema<IFlight>(
  {
    flightNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    airline: {
      type: Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },

    departureAirport: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    arrivalAirport: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },

    departureTime: {
      type: Date,
      required: true,
    },

    arrivalTime: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    aircraft: {
      type: String,
      trim: true,
    },

    stops: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    cabinClasses: [
      {
        class: {
          type: String,
          enum: ["economy", "premium_economy", "business", "first"],
          required: true,
        },

        totalSeats: {
          type: Number,
          required: true,
          min: 0,
        },

        availableSeats: {
          type: Number,
          required: true,
          min: 0,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        baggage: {
          cabinBaggageKg: {
            type: Number,
            required: true,
            min: 0,
            default: 7,
          },

          checkInBaggageKg: {
            type: Number,
            required: true,
            min: 0,
            default: 15,
          },
        },

        farePolicy: {
          refundable: {
            type: Boolean,
            default: false,
          },

          freeCancellation: {
            type: Boolean,
            default: false,
          },

          cancellationFee: {
            type: Number,
            min: 0,
            default: 0,
          },

          freeSeatSelection: {
            type: Boolean,
            default: false,
          },

          mealIncluded: {
            type: Boolean,
            default: false,
          },
        },
      },
    ],

    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled", "completed"],
      default: "scheduled",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

flightSchema.index({
  departureAirport: 1,
  arrivalAirport: 1,
  departureTime: 1,
});

flightSchema.index({
  airline: 1,
  flightNumber: 1,
});

flightSchema.pre("validate", function () {
  if (this.departureAirport?.equals(this.arrivalAirport)) {
    this.invalidate(
      "arrivalAirport",
      "Departure and arrival airports must be different"
    );
  }

  if (
    this.departureTime &&
    this.arrivalTime &&
    this.arrivalTime <= this.departureTime
  ) {
    this.invalidate(
      "arrivalTime",
      "Arrival should be after departure time"
    );
  }

  for (const cabin of this.cabinClasses) {
    if (cabin.availableSeats > cabin.totalSeats) {
      this.invalidate(
        "cabinClasses",
        "Available seats cannot exceed total seats"
      );
      break;
    }
  }
});

export const Flight = mongoose.model<IFlight>(
  "Flight",
  flightSchema
);
