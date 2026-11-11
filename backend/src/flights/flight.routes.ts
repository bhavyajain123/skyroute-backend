
import { Router } from "express";

import { getFlights } from "./flight.controller.js";
import { getFlightDetails } from "./flight-details.controller.js";
import { getFlightSeatMapController } from "./flight-seat.controller.js";
import { lockFlightSeatsController } from "./flight-seat-lock.controller.js";
import { getFlightAvailabilityController } from "./flight-availability.controller.js";

import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/search", getFlights);

router.get("/availability", getFlightAvailabilityController);

router.post("/seats/lock", authenticate, lockFlightSeatsController);
router.get("/seats/:flightId", getFlightSeatMapController);

router.get("/:id", getFlightDetails);

export default router;
