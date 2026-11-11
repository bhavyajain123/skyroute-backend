
import { Router } from "express";
import {
  createAirlineController,
  getAllAirlinesController,
  getAllAirlinesByIdController,
  updateAirlineController,
  deleteAirlineController,
} from "./airline.controller.js";

const router = Router();

router.post("/", createAirlineController);
router.get("/", getAllAirlinesController);
router.get("/:airlineId", getAllAirlinesByIdController);
router.patch("/:airlineId", updateAirlineController);
router.delete("/:airlineId", deleteAirlineController);

export default router;
