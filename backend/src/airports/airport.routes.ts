import {Router} from "express";
import { createAirportController, searchAirportsController,getAirportController,getAirportByIataCodeController,updateAirportController,deleteAirportController } from "./airport.controller.js";

const router= Router();

router.post("/", createAirportController);
router.get("/", searchAirportsController);
router.get("/iata/:iataCode", getAirportByIataCodeController);
router.get("/:airportId", getAirportController);
router.patch("/:airportId", updateAirportController);
router.delete("/:airportId", deleteAirportController);

export default router;