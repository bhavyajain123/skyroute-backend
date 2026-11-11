import {Router} from "express";
import { getBookings,getBookingByDetails } from "./admin-bookings.controller.js";

const router= Router();
router.get("/", getBookings);
router.get("/:id", getBookingByDetails);
export default router;