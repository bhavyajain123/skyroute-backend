
import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(100),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(7).max(20).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().min(1).max(72)
});

export const firebaseLoginSchema = z.object({
  idToken: z.string().min(1, "Firebase ID token is required")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FirebaseLoginInput = z.infer<typeof firebaseLoginSchema>;

export interface AuthTokenPayload {
  sub: string;
  role: "user" | "admin" | "support";
}
