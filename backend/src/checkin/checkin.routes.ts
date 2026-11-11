
import { Router } from "express";

import {checkInEligibility,checkInPassenger,} from "./checkin.controller.js";
  

import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get(
  "/:bookingId/eligibility",
  authenticate,
  checkInEligibility
);


router.post(
  "/:bookingId",
  authenticate,
  checkInPassenger
);

export default router;
