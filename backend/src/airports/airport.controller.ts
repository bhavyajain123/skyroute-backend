
import type { Request, Response } from "express";

import {
  createAirportSchema,
  updateAirportSchema,
  airportSearchSchema
} from "./airport.validation.js";

import {
  createAirport,
  getAirportById,
  getAirportByIataCode,
  searchAirports,
  updateAirport,
  deleteAirport
} from "./airport.service.js";

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function handleError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : "";

  const statusMap: Record<string, number> = {
    airport_not_found: 404,
    invalid_airport_id: 400,
    airport_iata_already_exists: 409,
    airport_icao_already_exists: 409
  };

  const isDuplicateKey =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;

  const statusCode = isDuplicateKey
    ? 409
    : statusMap[message] ?? 500;

  const responseMessage = isDuplicateKey
    ? "Airport code already exists"
    : statusMap[message] !== undefined
      ? message.replace(/_/g, " ")
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: responseMessage
  });
}


export async function createAirportController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = createAirportSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid airport data",
        errors: parsed.error.flatten()
      });
      return;
    }

    const airport = await createAirport(parsed.data);

    res.status(201).json({
      success: true,
      message: "Airport created successfully",
      data: airport
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function searchAirportsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = airportSearchSchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid search parameters",
        errors: parsed.error.flatten()
      });
      return;
    }

    const result = await searchAirports(parsed.data);

    res.status(200).json({
      success: true,
      data: result.airports,
      pagination: result.pagination
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function getAirportController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const airportId = getParam(req.params.airportId);

    if (!airportId) {
      res.status(400).json({
        success: false,
        message: "Airport ID is required"
      });
      return;
    }

    const airport = await getAirportById(airportId);

    res.status(200).json({
      success: true,
      data: airport
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getAirportByIataCodeController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const iataCode = getParam(req.params.iataCode);

    if (!iataCode || !/^[A-Za-z]{3}$/.test(iataCode)) {
      res.status(400).json({
        success: false,
        message: "Invalid IATA code"
      });
      return;
    }

    const airport = await getAirportByIataCode(iataCode);

    res.status(200).json({
      success: true,
      data: airport
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function updateAirportController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const airportId = getParam(req.params.airportId);

    if (!airportId) {
      res.status(400).json({
        success: false,
        message: "Airport ID is required"
      });
      return;
    }

    const parsed = updateAirportSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid airport update data",
        errors: parsed.error.flatten()
      });
      return;
    }

    const airport = await updateAirport(airportId, parsed.data);

    res.status(200).json({
      success: true,
      message: "Airport updated successfully",
      data: airport
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}


export async function deleteAirportController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const airportId = getParam(req.params.airportId);

    if (!airportId) {
      res.status(400).json({
        success: false,
        message: "Airport ID is required"
      });
      return;
    }

    const airport = await deleteAirport(airportId);

    res.status(200).json({
      success: true,
      message: "Airport deactivated successfully",
      data: airport
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
