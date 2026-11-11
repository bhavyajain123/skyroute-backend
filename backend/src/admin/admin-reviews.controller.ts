import type{Request, Response, NextFunction} from "express";
import { getAllReviews, getReviewById } from "./admin-reviews.service.js";

export const getReviews= async(
    req: Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const approved = req.query.isApproved;
    const rating = req.query.rating;

    if (
      approved !== undefined &&
      approved !== "true" &&
      approved !== "false"
    ) {
      res.status(400).json({
        success: false,
        message: "isApproved must be true or false"
      });
      return;
    }
    const parsedRating= rating=== undefined? undefined: Number(rating);

    if(
          parsedRating !== undefined &&
      (!Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5)
    ){
        res.status(400).json({
            success:false,
            message:"rating should be bw 1 to5"
        });
        return;
    }
    const result= await getAllReviews({
        page,
        limit,
        isApproved:
         approved === undefined ? undefined : approved === "true",
      rating: parsedRating
    });
    res.status(200).json({
        success:true,
        message:"review fetched successfully",
        data:result
    });
}catch(error){
    next(error);
}
};
export const getReviewDetails= async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try{
        const reviewId = req.params.id;

        if(typeof reviewId !== "string"){
            res.status(400).json({
                success:false,
                message:"invalid review id"
            });
            return;
        }
        const review= await getReviewById(reviewId);
        if(!review){
            res.status(404).json({
                success:false,
                message:"review not found"
            });
            return;
        }
        res.status(200).json({
            success:true,
            message:"review details fetched successfuly",
            data:review
        });
    }catch(error){
        next(error);
    }
};