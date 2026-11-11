import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { logger } from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();
    try{
      await connectRedis();
    }catch(error){
      logger.warn("redis unavailabe, continung without redis",{
        error:error instanceof Error? error.message:"unkown error",
      });
    }

    const server = app.listen(env.PORT, () => {

      console.log("SKYROUTE BACKEND");
      console.log(`Server: http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log("Database: Connected");
    });


    const shutdown = () => {
  console.log("Shutting down SkyRoute...");

  server.close(async () => {
    try {
      await disconnectRedis();

      const mongoose = await import("mongoose");
      await mongoose.default.disconnect();

      logger.info("SkyRoute shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("Shutdown failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      process.exit(1);
    }
  });
};

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
