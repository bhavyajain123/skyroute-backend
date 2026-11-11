import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { firebaseAuth } from "../config/firebase.js";
import { User } from "../users/user.model.js";
import type {
  RegisterInput,
  LoginInput,
  AuthTokenPayload
} from "./auth.types.js";

const JWT_SECRET: string = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

const SALT_ROUNDS = 12;

function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  });
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    passwordHash,
    ...(input.phone ? { phone: input.phone } : {})
  });

  const token = generateToken({
    sub: user._id.toString(),
    role: user.role
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified
    }
  };
}

export async function loginUser(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !user.passwordHash) {
  throw new Error("INVALID_CREDENTIALS");
}

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.accountStatus !== "active") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken({
    sub: user._id.toString(),
    role: user.role
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified
    }
  };
}



export async function loginWithFirebase(idToken: string) {
  const decodedToken = await firebaseAuth.verifyIdToken(idToken);

  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email?.toLowerCase().trim();

  if (!email) {
    throw new Error("FIREBASE_EMAIL_MISSING");
  }

  const fullName = decodedToken.name?.trim() || email.split("@")[0];
  const nameParts = fullName.split(/\s+/);

  const firstName = nameParts[0] || "SkyRoute";
  const lastName = nameParts.slice(1).join(" ") || "User";

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      user.firebaseUid = firebaseUid;
      user.isEmailVerified = decodedToken.email_verified ?? false;
      user.lastLoginAt = new Date();
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      firebaseUid,
      firstName,
      lastName,
      email,
      isEmailVerified: decodedToken.email_verified ?? false,
      lastLoginAt: new Date(),
    });
  }

  if (user.accountStatus !== "active") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  const token = generateToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
    },
  };
}
