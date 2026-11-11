
import { Router } from "express";
import {
  getUserProfileController,
  updateUserProfileController,
} from "./user.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getUserProfileController);
router.patch("/me", authenticate, updateUserProfileController);

export default router;
