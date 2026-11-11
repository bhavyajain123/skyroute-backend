
import mongoose, { Schema, type Document } from "mongoose";

export interface IAirport extends Document {
  name: string;
  iataCode: string;
  icaoCode?: string;
  city: string;
  country: string;
  countryCode: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const airportSchema = new Schema<IAirport>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    iataCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3
    },

    icaoCode: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 4,
      sparse: true,
      unique: true
    },

    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    country: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2
    },

    timezone: {
      type: String,
      trim: true
    },

    coordinates: {
      type: new Schema(
        {
          latitude: {
            type: Number,
            min: -90,
            max: 90
          },
          longitude: {
            type: Number,
            min: -180,
            max: 180
          }
        },
        { _id: false }
      ),
      required: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

airportSchema.index({ city: 1, country: 1 });

airportSchema.index({
  name: "text",
  city: "text",
  iataCode: "text",
  icaoCode: "text"
});

export const Airport = mongoose.model<IAirport>(
  "Airport",
  airportSchema
);
