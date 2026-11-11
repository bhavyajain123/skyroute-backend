import type { Request, Response } from "express";

import {
  registerSchema,
  loginSchema,
  firebaseLoginSchema
} from "./auth.types.js";

import {
  registerUser,
  loginUser,
  loginWithFirebase
} from "./auth.service.js";
export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration details",
      errors: validation.error.flatten().fieldErrors
    });
    return;
  }

  try {
    const result = await registerUser(validation.data);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "EMAIL_ALREADY_EXISTS" ||
        (error as Error & { code?: number }).code === 11000)
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
      return;
    }

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account"
    });
  }
}

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login details",
      errors: validation.error.flatten().fieldErrors
    });
    return;
  }

  try {
    const result = await loginUser(validation.data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
        return;
      }

      if (error.message === "ACCOUNT_NOT_ACTIVE") {
        res.status(403).json({
          success: false,
          message: "Your account is not active"
        });
        return;
      }
    }

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  }
}

export function logoutController(
  _req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: "Logout successful. Please clear your token on the client."
  });
}


export async function firebaseLoginController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = firebaseLoginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Firebase ID token is required",
      errors: validation.error.flatten().fieldErrors
    });
    return;
  }

  try {
    const result = await loginWithFirebase(validation.data.idToken);

    res.status(200).json({
      success: true,
      message: "Firebase authentication successful",
      data: result
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "FIREBASE_EMAIL_MISSING") {
        res.status(403).json({
          success: false,
          message: "Firebase email is missing"
        });
        return;
      }

      if (error.message === "ACCOUNT_NOT_ACTIVE") {
        res.status(403).json({
          success: false,
          message: "Your account is not active"
        });
        return;
      }

      if (error.message === "FIREBASE_ACCOUNT_MISMATCH") {
        res.status(409).json({
          success: false,
          message: "Unable to link this Firebase account"
        });
        return;
      }
    }

    console.error("Firebase authentication error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase authentication token"
    });
  }
}

