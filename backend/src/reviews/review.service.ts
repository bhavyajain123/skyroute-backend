import{Types} from "mongoose";

import{Review} from "./review.model.js";
import { Booking } from "../bookings/booking.model.js";
import type { CreateReviewInput, UpdateReviewInput, reviewQueryInput } from "./review.validation.js";

function getObjectId(id: string, error: string): Types.ObjectId {
    if(!Types.ObjectId.isValid(id)){
        throw new Error(error);
    }
    return new Types.ObjectId(id);
}
export async function createReview(
    userId:string,
    input:CreateReviewInput
){
    const userObjectId= getObjectId(userId, "invalid_user_id");
    const bookingObjectId= getObjectId(
        input.bookingId,
        "invalid_booking_id"
    );
     const booking = await Booking.findOne({
    _id: bookingObjectId,
    userId: userObjectId,
    status: "completed",
    paymentStatus: "paid",
  }).populate<{
    flight: {
      _id: Types.ObjectId;
      airline: Types.ObjectId;
    } | null;
  }>("flight", "airline");

  if (!booking) {
    throw new Error("eligible_booking_not_found");
  }

  if (!booking.flight || !booking.flight.airline) {
    throw new Error("flight_or_airline_not_found");
  }

const existingReview = await Review.findOne({
  userId: userObjectId,
  booking: booking._id,
});

  if (existingReview) {
    throw new Error("review_already_exists");
  }

  try {
    return await Review.create({
      userId: userObjectId,
      booking: booking._id,
      flight: booking.flight._id,
      airline: booking.flight.airline,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      categories: input.categories,
      isVerified: true,
      isApproved: false,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error("review_already_exists");
    }

    throw error;
  }
}
export async function getPublicReviews(
    query:  reviewQueryInput
){
    const {page,limit,rating,flightId, airlineId, sort}= query;

    const filter: Record<string, unknown>={
        isApproved:true,
        isVerified:true,
    };
    if(rating !== undefined){
        filter.rating= rating;
    }
     if (flightId) {
    filter.flight = getObjectId(flightId, "invalid_flight_id");
  }

  if (airlineId) {
    filter.airline = getObjectId(airlineId, "invalid_airline_id");
  }
 let sortQuery: Record<string, 1 | -1>;


  if (sort === "highest") {
    sortQuery = { rating: -1, createdAt: -1 };
  } else if (sort === "lowest") {
    sortQuery = { rating: 1, createdAt: -1 };
  } else if (sort === "oldest") {
    sortQuery = { createdAt: 1 };
  } else {
    sortQuery = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("-__v")
      .populate("userId", "firstName lastName")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}
export async function getMyReviews(
    userId:string,
    query:reviewQueryInput
){
    const userObjectId= getObjectId(userId, "invalid_user_id");
    const {page,limit}= query;

    const filter={userId: userObjectId};
    const skip=(page-1)*limit;

    const[reviews,total]= await Promise.all([
        Review.find(filter)
        .select("-__v")
        .populate("flight","flightNumber departureTime arrivalTime")
        .populate("airline","name logo")
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .lean(),

        Review.countDocuments(filter),
    ]);

     return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}
export async function getReviewById(
  userId: string,
  reviewId: string
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");
const reviewObjectId = getObjectId(reviewId, "invalid_review_id");

  const review = await Review.findOne({
    _id: reviewObjectId,
    userId: userObjectId,
  })
    .select("-__v")
    .populate("flight", "flightNumber departureTime arrivalTime")
    .populate("airline", "name logo");

  if (!review) {
    throw new Error("review_not_found");
  }

  return review;
}


export async function updateReview(
    userId:string,
    reviewId:string,
    input:UpdateReviewInput
){
    const userObjectId= getObjectId(userId,"invalid_user_id");
const reviewObjectId = getObjectId(reviewId, "invalid_review_id");

  const review = await Review.findOne({
  _id: reviewObjectId,
  userId: userObjectId,
});
    if(!review){
        throw new Error("review_not_found");
    }
    if(review.isApproved){
        throw new Error("approved_review_cannot_be_edited");
    }
    Object.assign(review,input);
    review.isApproved = false;
review.moderationStatus = "pending";
review.rejectionReason = undefined;
    await review.save();
    return review;
}
export async function deleteReview(
    userId:string,
    reviewId:string
){
    const userObjectId= getObjectId(userId,"invalid_user_id");
    const reviewObjectId= getObjectId(reviewId,"invalid_review_id");
    const review= await Review.findOneAndDelete({
        _id:reviewObjectId,
        userId:userObjectId,
    });
    if(!review){
        throw new Error("review_not_found");
    }
    return review;
}
export async function getAirlineRating(airlineId: string) {
  const airlineObjectId = getObjectId(
    airlineId,
    "invalid_airline_id"
  );

  const result = await Review.aggregate([
    {
      $match: {
        airline: airlineObjectId,
        isApproved: true,
        isVerified: true,
      },
    },
    {
      $group: {
        _id: "$airline",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result[0]?.averageRating;

  return {
    averageRating:
      averageRating != null
        ? Number(averageRating.toFixed(2))
        : 0,
    totalReviews: result[0]?.totalReviews ?? 0,
  };
}


export async function getPendingReviews(
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  const filter = {
    isApproved: false,
    $or: [
      { moderationStatus: "pending" },
      { moderationStatus: { $exists: false } },
    ],
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("-__v")
      .populate("userId", "firstName lastName email")
      .populate("flight", "flightNumber departureTime arrivalTime")
      .populate("airline", "name logo")
      .populate("booking", "bookingReference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllAdminReviews(
  page = 1,
  limit = 20,
  status?: "pending" | "approved" | "rejected"
) {
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (status === "pending") {
    filter.isApproved = false;
    filter.$or = [
      { moderationStatus: "pending" },
      { moderationStatus: { $exists: false } },
    ];
  } else if (status === "approved") {
    filter.isApproved = true;
  } else if (status === "rejected") {
    filter.moderationStatus = "rejected";
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("-__v")
      .populate("userId", "firstName lastName email")
      .populate("flight", "flightNumber departureTime arrivalTime")
      .populate("airline", "name logo")
      .populate("booking", "bookingReference")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function approveReview(reviewId: string) {
  const reviewObjectId = getObjectId(
    reviewId,
    "invalid_review_id"
  );

  const review = await Review.findById(reviewObjectId);

  if (!review) {
    throw new Error("review_not_found");
  }

  review.isApproved = true;
  review.moderationStatus = "approved";
  review.rejectionReason = undefined;

  await review.save();

  return review;
}


export async function rejectReview(
  reviewId: string,
  reason: string
) {
  const reviewObjectId = getObjectId(
    reviewId,
    "invalid_review_id"
  );

  const review = await Review.findById(reviewObjectId);

  if (!review) {
    throw new Error("review_not_found");
  }

  review.isApproved = false;
  review.moderationStatus = "rejected";
  review.rejectionReason = reason;

  await review.save();

  return review;
}