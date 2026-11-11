
import mongoose, {
  Schema,
  type Document,
  type Types
} from "mongoose";

export interface IPayment extends Document {
  booking: Types.ObjectId;
  userId?: Types.ObjectId;

  provider: "mock";

  transactionId: string;

  amount: number;
  currency: string;

  method?: "card" | "upi" | "netbanking" | "wallet" | "cash";

  status:
    | "created"
    | "authorized"
    | "captured"
    | "failed"
    | "refunded";

  failureReason?: string;
  refundId?: string;
  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    provider: {
      type: String,
      enum: ["mock"],
      default: "mock",
      required: true
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true
    },

    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "cash"]
    },

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded"
      ],
      default: "created"
    },

    failureReason: {
      type: String,
      trim: true
    },

    refundId: {
      type: String,
      trim: true
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
paymentSchema.index(
  {booking:1},
  {
    unique:true,
    partialFilterExpression:{
      status:"created",
    },
  }
);

paymentSchema.index({ booking: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);
