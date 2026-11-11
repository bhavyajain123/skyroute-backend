import {Router} from "express";
import { getAirlines, getAirlineDetails } from "./admin-airlines.controller.js";

const router= Router();
router.get("/", getAirlines);
router.get("/:id", getAirlineDetails);
export default router;