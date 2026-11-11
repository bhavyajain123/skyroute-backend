
import { Airport } from "../airports/airport.model.js";
import { Flight } from "./flight.model.js";

type TravelClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

interface FlightAvailabilityInput {
  origin: string;
  destination: string;
  month: string;
  passengers: number;
  travelClass: TravelClass;
}

interface AvailableDate {
  date: string;
  availableFlights: number;
  lowestPrice: number;
}


function localDateToUTC(
  dateString: string,
  timezone: string
): Date {
  const [year, month, day] = dateString.split("-").map(Number);

  const utcGuess = Date.UTC(year, month - 1, day);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(utcGuess));

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  const localAsUTC = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute)
  );

  return new Date(utcGuess - (localAsUTC - utcGuess));
}

export async function getFlightAvailability(
  input: FlightAvailabilityInput
): Promise<AvailableDate[]> {
  const [originAirport, destinationAirport] = await Promise.all([
    Airport.findOne({
      iataCode: input.origin,
      isActive: true,
    }).select("_id timezone"),

    Airport.findOne({
      iataCode: input.destination,
      isActive: true,
    }).select("_id"),
  ]);

  if (!originAirport || !destinationAirport) {
    return [];
  }

  const timezone = originAirport.timezone || "UTC";

  const [year, month] = input.month.split("-").map(Number);

  const firstDay = `${input.month}-01`;

  const nextMonthDate = new Date(Date.UTC(year, month, 1));

  const nextMonth = nextMonthDate.toISOString().slice(0, 10);

  const startDate = localDateToUTC(firstDay, timezone);
  const endDate = localDateToUTC(nextMonth, timezone);

  const now = new Date();

  const results = await Flight.aggregate<AvailableDate>([
    {
      $match: {
        departureAirport: originAirport._id,
        arrivalAirport: destinationAirport._id,

        departureTime: {
          $gte: startDate > now ? startDate : now,
          $lt: endDate,
        },

        isActive: true,
        status: { $in: ["scheduled", "delayed"] },

        cabinClasses: {
          $elemMatch: {
            class: input.travelClass,
            availableSeats: { $gte: input.passengers },
          },
        },
      },
    },

    {
      $addFields: {
        selectedCabin: {
          $first: {
            $filter: {
              input: "$cabinClasses",
              as: "cabin",
              cond: {
                $eq: ["$$cabin.class", input.travelClass],
              },
            },
          },
        },
      },
    },

    {
      $addFields: {
        localDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$departureTime",
            timezone,
          },
        },
      },
    },

    {
      $group: {
        _id: "$localDate",
        availableFlights: { $sum: 1 },
        lowestPrice: { $min: "$selectedCabin.price" },
      },
    },

    {
      $project: {
        _id: 0,
        date: "$_id",
        availableFlights: 1,
        lowestPrice: 1,
      },
    },

    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return results;
}
