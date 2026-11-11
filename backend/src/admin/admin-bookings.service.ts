import{Booking} from "../bookings/booking.model.js";
interface GetBookingOptions{
    page?: number;
    limit?:number;
    status?: "pending"| "confirmed"| "cancelled"| "completed",
    paymentStatus?:"pending"| "paid"|"failed"| "refunded";
}
export const getAllBookings= async(
    options:GetBookingOptions={}
)=>{
    const page= Math.max(1, options.page??1);
    const limit= Math.min(100, Math.max(1,options.limit??10));
    const filter:Record<string,unknown>={};
    if(options.status){
        filter.status= options.status;

    }
    if(options.paymentStatus){
        filter.paymentStatus= options.paymentStatus;
    }
    const[bookings, totalBookings]= await Promise.all([
        Booking.find(filter)
        .populate("userId", "firstName lastName email")
      .populate("flight")
      .populate("passengers")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
      Booking.countDocuments(filter)
    ]);
    return{
        bookings,
        pagination:{page, limit, totalBookings, totalPages:Math.ceil(totalBookings/limit)}
    };
};
export const getBookingById= async(bookingId:string)=>{
    return Booking.findById(bookingId)
        .populate("userId", "firstName lastName email")
    .populate("flight")
    .populate("passengers")
    .lean();
};
