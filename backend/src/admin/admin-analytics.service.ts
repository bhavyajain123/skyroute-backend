
import { Booking } from "../bookings/booking.model.js";
import { Payment } from "../payments/payment.model.js";

const getMonthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

export async function getAdminAnalytics() {
  const now = new Date();

  
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
  );

  const [
    monthlyBookings,
    bookingStatuses,
    monthlyRevenue,
    routeDistribution
  ] = await Promise.all([

   
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),

   
    Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),

    
    Payment.aggregate([
      {
        $match: {
          status: "captured",
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),

   
    Booking.aggregate([
      {
        $lookup: {
          from: "flights",
          localField: "flight",
          foreignField: "_id",
          as: "flight"
        }
      },
      { $unwind: "$flight" },
      {
        $lookup: {
          from: "airports",
          localField: "flight.departureAirport",
          foreignField: "_id",
          as: "departure"
        }
      },
      {
        $lookup: {
          from: "airports",
          localField: "flight.arrivalAirport",
          foreignField: "_id",
          as: "arrival"
        }
      },
      { $unwind: "$departure" },
      { $unwind: "$arrival" },
      {
        $group: {
          _id: {
            $cond: [
              {
                $eq: [
                  "$departure.countryCode",
                  "$arrival.countryCode"
                ]
              },
              "Domestic",
              "International"
            ]
          },
          bookings: { $sum: 1 }
        }
      }
    ])
  ]);


  const bookingMap = new Map(
    monthlyBookings.map(item => [
      `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      item.bookings
    ])
  );

  const revenueMap = new Map(
    monthlyRevenue.map(item => [
      `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      item.revenue
    ])
  );

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1)
    );

    const key = getMonthKey(date);

    return {
      month: date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC"
      }),
      bookings: bookingMap.get(key) || 0,
      revenue: revenueMap.get(key) || 0
    };
  });

const statusMap = new Map<string, number>();

for (const item of bookingStatuses) {
  const status =
    item._id === "complete" ? "completed" : item._id;

  statusMap.set(
    status,
    (statusMap.get(status) || 0) + item.count
  );
}

const statusDistribution = Array.from(
  statusMap,
  ([status, bookings]) => ({
    status,
    bookings,
  })
);

  const distribution = routeDistribution.map(item => ({
    type: item._id,
    bookings: item.bookings
  }));

  return {
    monthlyTrend,
    statusDistribution,
    routeDistribution: distribution,
    currency: "INR"
  };
}
