
import type { Request, Response } from "express";

import {
  createPassenger,
  getMyPassenger,
  updatePassenger,
  deletePassenger,
} from "./passenger.service.js";
import {

  createPassengerSchema,
  updatePassengerSchema,

}  from "./passenger.validation.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string;  };
  
}

function getUserId(req: AuthenticatedRequest): string | null {
  const userId = req.user?.id;

  return typeof userId === "string" && userId.trim()
    ? userId
    : null;
}

function getPassengerId(
  value: string | string[] | undefined
): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function handleError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : "";
const statusMap: Record<string, number> = {
  invalid_user_id: 400,
  invalid_passenger_id: 400,
  passenger_not_found: 404,
  passport_number_required: 400,
  passport_expiry_required: 400,
  passport_expired: 400,
};

  const statusCode = statusMap[message] ?? 500;
  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500

           ? "Something went wrong"
        : message.replace(/_/g, " "),

   });

}


export async function createPassengerController (
   req: AuthenticatedRequest,

  res: Response

): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json ({

        success: false,
          message: "Authentication required",

      });
      return;
    }

    const validation = createPassengerSchema.safeParse(req.body);
    if (!validation.success) {

      res.status(400).json ({

        success: false,
        message: "Invalid passenger details",
        errors: validation.error.flatten(),
      });

        return;

    }

    const passenger = await createPassenger(userId, validation.data);
    res.status(201).json({

      success: true,
      message: "Passenger created successfully",
       
      data: passenger,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getMyPassengersController(
  req: AuthenticatedRequest,

  res: Response

):  Promise<void>  {

  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const passengers = await getMyPassenger(userId);
    res.status(200).json({

      success: true,
      count: passengers.length,
      data: passengers,

    });

  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function updatePassengerController  (
    req: AuthenticatedRequest,

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
    const passengerId = getPassengerId(req.params.passengerId);

    if (!passengerId) {
      res.status(400).json({
        success: false,
          message: "Passenger ID is required",
      });

      return;


    }

      const validation = updatePassengerSchema.safeParse(req.body);
    if (!validation.success) {

      res.status(400).json ({

        success: false,
        message: "Invalid passenger details",
         errors: validation.error.flatten(),
         
      });
      return;
    }

    const passenger = await updatePassenger (

      userId,
      passengerId,
      validation.data

    );

    res.status(200).json ({

      success: true,

         message: "Passenger updated successfully",
       data: passenger,

    });

  }  catch (error: unknown) {

    handleError(res, error);
    
  }
}


export async function deletePassengerController(
  req: AuthenticatedRequest,
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

    const passengerId = getPassengerId(req.params.passengerId);

    if (!passengerId) {
      res.status(400).json({
        success: false,
        message: "Passenger ID is required",
      });
      return;
    }

    await deletePassenger(userId, passengerId);

    res.status(200).json({
      success: true,
      message: "Passenger deleted successfully",
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
