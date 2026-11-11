import {Router} from "express";
import { createPassengerController, getMyPassengersController, updatePassengerController, deletePassengerController } from "./passenger.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
const router=Router();

router.post("/", authenticate, createPassengerController);
router.get("/my-passengers", authenticate, getMyPassengersController);
router.patch("/:passengerId", authenticate, updatePassengerController);
router.delete("/:passengerId", authenticate, deletePassengerController);
export default router;