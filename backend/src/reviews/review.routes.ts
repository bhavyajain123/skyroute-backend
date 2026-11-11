import { Router } from "express";

import {
  createReviewController,
  getPublicReviewsController,
  getMyReviewsController,
  getReviewByIdController,
  updateReviewController,
  deleteReviewController,
  getAirlineRatingController,
  getPendingReviewsController,
  getAllAdminReviewsController,
  approveReviewController,
  rejectReviewController,
} from "./review.controller.js";

import {
  authenticate,
  authorizeAdmin,
} from "../auth/auth.middleware.js";

const router = Router();


router.get("/", getPublicReviewsController);
router.get("/airline/:airlineId/rating", getAirlineRatingController);

// Admin routes
router.get(
  "/admin/pending",
  authenticate,
  authorizeAdmin,
  getPendingReviewsController
);

router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  getAllAdminReviewsController
);

router.patch(
  "/admin/:reviewId/approve",
  authenticate,
  authorizeAdmin,
  approveReviewController
);

router.patch(
  "/admin/:reviewId/reject",
  authenticate,
  authorizeAdmin,
  rejectReviewController
);

router.post("/", authenticate, createReviewController);
router.get("/my-reviews", authenticate, getMyReviewsController);
router.get("/:reviewId", authenticate, getReviewByIdController);
router.patch("/:reviewId", authenticate, updateReviewController);
router.delete("/:reviewId", authenticate, deleteReviewController);

export default router;