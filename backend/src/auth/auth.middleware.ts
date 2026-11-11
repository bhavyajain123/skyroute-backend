
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthTokenPayload {
  sub: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required"
    });
    return;
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Authentication configuration error"
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;

    if (!decoded.sub || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
      return;
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}
export function authorizeAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
}