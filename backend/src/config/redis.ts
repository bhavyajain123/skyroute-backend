import { Redis } from "ioredis";
import{logger} from "./logger.js";

const redisUrl= process.env.REDIS_URL;
export const redis: InstanceType<typeof Redis> | null = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
      retryStrategy(times: number) {
        if (times > 5) {
          logger.error("Redis connection retries exhausted");
          return null;
        }

        return Math.min(times * 1000, 5000);
      },
    })
  : null;

  if(redis){
    redis.on("connect",()=>{
        logger.info("redis connection established");
    });
    redis.on("ready",()=>{
        logger.info("redis is ready");
    });
    redis.on("error",(error:Error)=>{
        logger.error("redis connection error",{
            message:error.message,
        });
    });
    redis.on("close",()=>{
        logger.warn("redis connection closed");
    });
    redis.on("reconnection",()=>{
        logger.warn("redis reconnecting");
    });
  }else{
    logger.warn("redis_url is not configured. redis is disabled");
  }
    export async function connectRedis(): Promise<void>{
        if(!redis){
            logger.warn("redis connection skipped");
            return;
        }
        if(redis.status=== "ready"){
            return;
        }
         try {
    await redis.connect();
    logger.info("Redis connected successfully");
  } catch (error) {
    logger.error("Unable to connect to Redis", {
      message:
        error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redis || redis.status === "end") {
    return;
  }

  await redis.quit();
  logger.info("Redis disconnected successfully");
}

export function isRedisConnected(): boolean {
  return redis?.status === "ready";
}
    
  