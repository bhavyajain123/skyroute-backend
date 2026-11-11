import type{Request, Response} from "express";

import { createReviewSchema, updateReviewSchema, reviewQuerySchema } from "./review.validation.js";
import {
  createReview,
  getPublicReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getAirlineRating,
  getPendingReviews,
  getAllAdminReviews,
  approveReview,
  rejectReview,
} from "./review.service.js";

function getUserId(req:Request):string|null{
    const userId=(
        req as Request &{
            user?:{id?: string};
        }
    ).user?.id;
if(typeof userId !=="string"|| !userId.trim()){
  return null;
}
return userId;
}
function getParam(value:string |string[] | undefined):string{
    if(Array.isArray(value)){
      return value[0] ?? "";
    }
    return value ?? "";
}
function handleError(res: Response, error: unknown): void {
    const message= error instanceof Error? error.message:"";

     const statusMap: Record<string, number> = {
    invalid_user_id: 400,
    invalid_booking_id: 400,
    invalid_review_id: 400,
    invalid_airline_id: 400,
    invalid_flight_id: 400,

    eligible_booking_not_found: 404,
    flight_or_airline_not_found: 404,
    review_not_found: 404,

    review_already_exists: 409,

    approved_review_cannot_be_edited: 403,
  };

  const duplicate =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;

const status = duplicate ? 409 : statusMap[message] ?? 500;

  res.status(status).json({
    success: false,
    message: duplicate
      ? "Review already exists"
      : status === 500
        ? "Internal server error"
        : message.replace(/_/g, " "),
  });
}

export async function createReviewController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const userId = getUserId(req);

        if(!userId){
            res.status(401).json({
                success:false,
                message:"authentication req",
            });
            return;
        }
        const result= createReviewSchema.safeParse(req.body);


        if(!result.success){
            res.status(400).json({
                success:false,
                message:"invalid review data",
                errors:result.error.flatten(),
            });
            return;
        }
        const review= await createReview(userId, result.data);
        res.status(201).json({
            success:true,
            message:"review submitted successfully",
            data:review,
        });
    }catch(error){
        handleError(res,error);
    }
}
export async function getPublicReviewsController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const result= reviewQuerySchema.safeParse(req.query);
        if(!result.success){
            res.status(400).json({
                success:false,
                message:"invalid review query",
                errors:result.error.flatten(),
            });
            return;
        }
        const reviews= await getPublicReviews(result.data);
        res.status(200).json({
            success:true,
            data:reviews.reviews,
            pagination:reviews.pagination,
        });
    }catch(error:unknown){
        handleError(res,error);
    }
}
export async function getMyReviewsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const result = reviewQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid review query",
        errors: result.error.flatten(),
      });
      return;
    }

    const reviews = await getMyReviews(userId, result.data);

    res.status(200).json({
      success: true,
      data: reviews.reviews,
      pagination: reviews.pagination,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function getReviewByIdController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const userId= getUserId(req);
        if(!userId){
            res.status(401).json({
                success:false,
                message:"authentication required",
            })
            return;
        }
        const reviewId= getParam(req.params.reviewId);
        if(!reviewId){
            res.status(400).json({
                success:false,
                message:"review id req",
            });
            return;
        }
        const review= await getReviewById(userId, reviewId);
        res.status(200).json({
            success:true,
            data:review,
        });
    }catch(error:unknown){
        handleError(res,error);
    }
}
export async function updateReviewController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const reviewId = getParam(req.params.reviewId);

    if (!reviewId) {
      res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
      return;
    }

    const result = updateReviewSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid review update data",
        errors: result.error.flatten(),
      });
      return;
    }

    const review = await updateReview(userId, reviewId, result.data);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function deleteReviewController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const userId= getUserId(req);

        if(!userId){
            res.status(401).json({
                success:false,
                message:"authentication req",
            });
            return;
        }
        const reviewId= getParam(req.params.reviewId);
        if(!reviewId){
            res.status(400).json({
                success:false,
                message:"review id req",
            });
            return;
        }
        await deleteReview(userId, reviewId);
        res.status(200).json({
            success:true,
            message:"review deleted successfully",
        });
    }catch(error:unknown){
        handleError(res,error);
    }
}
export async function getAirlineRatingController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const airlineId = getParam(req.params.airlineId);

    if (!airlineId) {
      res.status(400).json({
        success: false,
        message: "Airline ID is required",
      });
      return;
    }

    const result = await getAirlineRating(airlineId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


function getAdminPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 20)
  );

  return { page, limit };
}


export async function getPendingReviewsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { page, limit } = getAdminPagination(req);

    const result = await getPendingReviews(page, limit);

    res.status(200).json({
      success: true,
      message: "Pending reviews fetched successfully",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getAllAdminReviewsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { page, limit } = getAdminPagination(req);

    const status = getParam(
      req.query.status as string | string[] | undefined
    );

    if (
      status &&
      !["pending", "approved", "rejected"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
      return;
    }

    const result = await getAllAdminReviews(
      page,
      limit,
      status as "pending" | "approved" | "rejected" | undefined
    );

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function approveReviewController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reviewId = getParam(req.params.reviewId);

    if (!reviewId) {
      res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
      return;
    }

    const review = await approveReview(reviewId);

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: review,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function rejectReviewController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reviewId = getParam(req.params.reviewId);

    if (!reviewId) {
      res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
      return;
    }

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!reason || reason.length > 500) {
      res.status(400).json({
        success: false,
        message: "Rejection reason is required and must be under 500 characters",
      });
      return;
    }

    const review = await rejectReview(reviewId, reason);

    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: review,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}