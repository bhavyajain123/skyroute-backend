import {Router} from "express";
import { getReviews, getReviewDetails } from "./admin-reviews.controller.js";

const router= Router();
router.get("/", getReviews);
router.get("/:id", getReviewDetails);
export default router;