
import mongoose from "mongoose";
import dns from "node:dns";

import { env } from "./env.js";


dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

export const connectDB = async (): Promise<void> => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log("MongoDB connected successfully!");
    console.log(`Database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
