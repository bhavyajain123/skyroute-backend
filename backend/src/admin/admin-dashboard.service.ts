
import { User } from "../users/user.model.js";
import { Booking } from "../bookings/booking.model.js";
import { Payment } from "../payments/payment.model.js";

export const getAdminDashboardStats = async () => {
  const [
    totalUsers,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    paymentStats,
    weeklyStats,
  ] = await Promise.all([
    User.countDocuments({ accountStatus: "active" }),

    Booking.countDocuments(),

    Booking.countDocuments({
      status: "confirmed",
    }),

    Booking.countDocuments({
      status: "cancelled",
    }),

    Payment.aggregate([
      {
        $match: {
          status: { $in: ["captured", "refunded"] },
        },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
        },
      },
    ]),

    Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().setDate(new Date().getDate() - 6)
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),
  ]);

  const totalRevenue = paymentStats
    .filter((item) => item._id === "captured")
    .reduce((sum, item) => sum + item.total, 0);

  const totalRefunds = paymentStats
    .filter((item) => item._id === "refunded")
    .reduce((sum, item) => sum + item.total, 0);

  const bookingConfirmationRate =
    totalBookings > 0
      ? Number(((confirmedBookings / totalBookings) * 100).toFixed(2))
      : 0;

  
  const weeklyActivity = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    }).format(date);

    const matchingDay = weeklyStats.find(
      (item) => item._id === dateKey
    );

    weeklyActivity.push({
      date: dateKey,
      day: dayName,
      bookings: matchingDay?.total ?? 0,
    });
  }

  return {
    user: {
      total: totalUsers,
    },

    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      confirmationRate: bookingConfirmationRate,
      weeklyActivity,
    },

    payments: {
      grossBookingValue: totalRevenue,
      totalRevenue,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      current: "INR",
    },
  };
};
