
import type { Request, Response } from "express";

import {
  createMockPayment,
  completeMockPayment,
} from "./payment.service.js";

import {
  createMockPaymentSchema,
  mockPaymentResultSchema,
} from "./payment.validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

function handlePaymentError(res: Response, error: unknown): void {
  const message =
    error instanceof Error ? error.message : "";

  console.error("PAYMENT ERROR:", error);

  const errorText = message.toLowerCase();

  let statusCode = 500;

  if (
    errorText.includes("mock payment") &&
    errorText.includes("disabled")
  ) {
    statusCode = 403;
  } else if (
    errorText.includes("booking_not_found") ||
    errorText.includes("payment_not_found")
  ) {
    statusCode = 404;
  } else if (
    errorText.includes("payment_not_allowed") ||
    errorText.includes("invalid_user_id")
  ) {
    statusCode = 403;
  } else if (
    errorText.includes("already_processed") ||
    errorText.includes("not_eligible")
  ) {
    statusCode = 409;
  } else if (
    errorText.includes("invalid_booking") ||
    errorText.includes("invalid_payment")
  ) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Unable to process payment"
        : message,
  });
}


export async function createMockPaymentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = createMockPaymentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid payment details",
        errors: validation.error.flatten(),
      });
      return;
    }

    const payment = await createMockPayment(
      validation.data,
      userId
    );

    res.status(201).json({
      success: true,
      message: "Mock payment created successfully",
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        bookingId: payment.booking,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        provider: payment.provider,
      },
    });
  } catch (error: unknown) {
    handlePaymentError(res, error);
  }
}

export async function completeMockPaymentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = mockPaymentResultSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid payment result details",
        errors: validation.error.flatten(),
      });
      return;
    }

    const payment = await completeMockPayment(
      validation.data,
      userId
    );

    res.status(200).json({
      success: true,
      message:
        payment.status === "captured"
          ? "Mock payment successful, booking confirmed"
          : "Mock payment failed",
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        bookingId: payment.booking,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        provider: payment.provider,
      },
    });
  } catch (error: unknown) {
    handlePaymentError(res, error);
  }
}
