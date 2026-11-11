
import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  booking: Types.ObjectId;
  flight: Types.ObjectId;
  airline: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;

  categories?: {
    cleanliness?: number;
    comfort?: number;
    staffService?: number;
    valueForMoney?: number;
  };

  isVerified: boolean;
  isApproved: boolean;

  moderationStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    flight: {
      type: Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    airline: {
      type: Schema.Types.ObjectId,
      ref: "Airline",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      staffService: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { userId: 1, booking: 1 },
  { unique: true }
);

reviewSchema.index({ airline: 1, isApproved: 1 });
reviewSchema.index({ flight: 1, isApproved: 1 });

export const Review = mongoose.model<IReview>(
  "Review",
  reviewSchema
);
