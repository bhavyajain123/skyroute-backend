import {Router} from "express";
import{getPayments, getPaymentDetails} from "./admin-payments.controller.js";
const router= Router();

router.get("/", getPayments);
router.get("/:id", getPaymentDetails);
export default router;