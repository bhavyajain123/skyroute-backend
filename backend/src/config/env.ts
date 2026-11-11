import dotenv from "dotenv";
import{z} from "zod";
dotenv.config();

const envSchema= z.object({
     NODE_ENV: z.enum([
    "development",
    "production",
    "test"
  ]).default("development"),
    
     PORT: z.coerce.number().default(5000),

  CLIENT_URL: z.string().url(),

  MONGO_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  AMADEUS_CLIENT_ID: z.string().optional(),
  AMADEUS_CLIENT_SECRET: z.string().optional(),

  AMADEUS_BASE_URL: z.string().url().default(
    "https://test.api.amadeus.com"
  ),

  GEMINI_API_KEY: z.string().optional(),

GEMINI_MODEL: z.string().default("gemini-3.8-flash"),

  RESEND_API_KEY:z.string().optional(),
   
   EMAIL_FROM: z.string().optional(),
    REDIS_URL: z.string().optional()
});
export const env = envSchema.parse(process.env);