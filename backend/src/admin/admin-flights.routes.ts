import {Router} from "express";
import { getFlights,getFlightDetails } from "./admin-flights.controller.js";

const router=Router();
router.get("/",getFlights);
router.get("/:id",getFlightDetails);
export default router;