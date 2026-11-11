
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import adminRoutes from "./admin/admin.routes.js";
import adminUsersRoutes from "./admin/admin-users.routes.js";
import adminBookingsRoutes from "./admin/admin-bookings.routes.js";
import adminPaymentsRoutes from "./admin/admin-payments.routes.js";
import adminFlightsRoutes from "./admin/admin-flights.routes.js";
import adminAirlinesRoutes from "./admin/admin-airlines.routes.js";
import adminReviewsRoutes from "./admin/admin-reviews.routes.js";
import flightRoutes from "./flights/flight.routes.js";
import bookingRoutes from "./bookings/booking.routes.js";
import paymentRoutes from "./payments/payment.routes.js";
import ticketRoutes from "./tickets/ticket.routes.js";
import ticketVerificationRoutes from "./tickets/ticket-verification.routes.js";
import userRoutes from "./users/user.routes.js";
import passengerRoutes from "./passengers/passenger.routes.js";
import airlineRoutes from "./airlines/airline.routes.js";
import airportRoutes from "./airports/airport.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import reviewRoutes from "./reviews/review.routes.js";
import authRoutes from "./auth/auth.routes.js";

import aiRoutes from "./ai/ai.routes.js";

import { env } from "./config/env.js";

const app = express();

app.disable("x-powered-by");


app.use(helmet());


app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300
  })
);


app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/bookings", adminBookingsRoutes);
app.use("/api/admin/payments", adminPaymentsRoutes);
app.use("/api/admin/flights", adminFlightsRoutes);
app.use("/api/admin/airlines", adminAirlinesRoutes);
app.use("/api/admin/reviews", adminReviewsRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets/verify", ticketVerificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/airlines", airlineRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/ai", aiRoutes);


app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    application: "SkyRoute",
    message: "Welcome to SkyRoute Backend",
    version: "1.0.0"
  });
});


app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    application: "SkyRoute",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

export default app;
