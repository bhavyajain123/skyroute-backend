
interface PopulatedAirline {
  _id: unknown;
  name?: string;
  iataCode?: string;
  logo?: string;
}

interface PopulatedAirport {
  _id: unknown;
  name?: string;
  iataCode?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface FlightResponseInput {
  _id: unknown;
  flightNumber: string;
  airline: PopulatedAirline | null;
  departureAirport: PopulatedAirport | null;
  arrivalAirport: PopulatedAirport | null;
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  aircraft?: string;
  stops?: number;

  cabinClasses: {
    class: string;
    totalSeats: number;
    availableSeats: number;
    price: number;

    baggage?: {
      cabinBaggageKg: number;
      checkInBaggageKg: number;
    };

    farePolicy?: {
      refundable: boolean;
      freeCancellation: boolean;
      cancellationFee: number;
      freeSeatSelection: boolean;
      mealIncluded: boolean;
    };
  }[];

  status: string;
}

export function formatFlightResponse(flight: FlightResponseInput) {
  const airline = flight.airline;
  const departureAirport = flight.departureAirport;
  const arrivalAirport = flight.arrivalAirport;

  return {
    id: String(flight._id),

    flightNumber: flight.flightNumber,

    airline: {
      id: airline?._id ? String(airline._id) : null,
      name: airline?.name ?? null,
      code: airline?.iataCode ?? null,
      logo: airline?.logo ?? null,
    },

    departure: {
      airportId: departureAirport?._id
        ? String(departureAirport._id)
        : null,
      airportName: departureAirport?.name ?? null,
      airportCode: departureAirport?.iataCode ?? null,
      city: departureAirport?.city ?? null,
      country: departureAirport?.country ?? null,
      time: flight.departureTime,
      coordinates: departureAirport?.coordinates ?? null,
    },

    arrival: {
      airportId: arrivalAirport?._id
        ? String(arrivalAirport._id)
        : null,
      airportName: arrivalAirport?.name ?? null,
      airportCode: arrivalAirport?.iataCode ?? null,
      city: arrivalAirport?.city ?? null,
      country: arrivalAirport?.country ?? null,
      time: flight.arrivalTime,
      coordinates: arrivalAirport?.coordinates ?? null,
    },

    durationMinutes: flight.durationMinutes,
    aircraft: flight.aircraft ?? null,
    stops: flight.stops ?? 0,

    cabinClasses: flight.cabinClasses.map((cabin) => ({
      class: cabin.class,
      totalSeats: cabin.totalSeats,
      availableSeats: cabin.availableSeats,
      price: cabin.price,

      baggage: {
        cabinBaggageKg: cabin.baggage?.cabinBaggageKg ?? 0,
        checkInBaggageKg: cabin.baggage?.checkInBaggageKg ?? 0,
      },

      farePolicy: {
        refundable: cabin.farePolicy?.refundable ?? false,
        freeCancellation: cabin.farePolicy?.freeCancellation ?? false,
        cancellationFee: cabin.farePolicy?.cancellationFee ?? 0,
        freeSeatSelection: cabin.farePolicy?.freeSeatSelection ?? false,
        mealIncluded: cabin.farePolicy?.mealIncluded ?? false,
      },
    })),

    status: flight.status,
  };
}
