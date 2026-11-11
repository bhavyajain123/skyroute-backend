import { Payment } from "../payments/payment.model.js";
interface GetPaymentsOptions{
    page?:number;
    limit?: number;
    status?: "created"| "authorized" | "captured" | "failed" | "refunded";
}
export const getAllPayments=async(options: GetPaymentsOptions={})=>{
     const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 10));
  const filter: Record<string,unknown>={};
  if(options.status){
    filter.status= options.status;
  }
   const [payments, totalPayments] = await Promise.all([
    Payment.find(filter)
      .select("-razorpaySignature")
      .populate("booking", "bookingReference totalAmount status")
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter)
  ]);
  return{
    payments,
    pagination:{currentPage: page, limit, totalPayments,totalPages:Math.ceil(totalPayments/limit)}
  };
};
export const getPaymentById = async (paymentId: string) => {
  return Payment.findById(paymentId)
    .select("-razorpaySignature")
    .populate("booking")
    .populate("userId", "firstName lastName email")
    .lean();
};