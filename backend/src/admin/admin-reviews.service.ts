import {Review} from "../reviews/review.model.js";
interface GetReviewsOptions{
    page?: number;
    limit?:number;
    isApproved?: boolean;
    rating?:number;
}
export const getAllReviews= async(
    options: GetReviewsOptions={}
)=>{
     const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 10));

  const filter: Record<string, unknown> = {};

  if (typeof options.isApproved === "boolean") {
    filter.isApproved = options.isApproved;
  }
  if(typeof options.rating==="number"){
    filter.rating= options.rating;
  }
 const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("booking", "bookingReference")
      .populate("flight", "flightNumber")
      .populate("airline", "name iataCode")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter)
  ]);
  return{
    reviews,
    pagination:{
        currentPage:page,
        limit,
        totalReviews,
        totalPages:Math.ceil(totalReviews/limit)
    }
  };
};
export const getReviewById= async(reviewId:string)=>{
    return Review.findById(reviewId)
    .populate("userId", "firstName lastName email")
    .populate("booking", "bookingReference")
    .populate("flight")
    .populate("airline")
    .lean();
};