import { Router } from "express";
import {
  createMockPaymentController,
  completeMockPaymentController
} from "./payment.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post("/mock/create", authenticate, createMockPaymentController);
router.post("/mock/complete", authenticate, completeMockPaymentController);

export default router;