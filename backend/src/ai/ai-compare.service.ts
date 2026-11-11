
import { generateAIResponse } from "../integrations/gemini/gemini.client.js";
import { searchFlights } from "../flights/flight.service.js";

import type { FlightSearchInput } from "../flights/flight.validation.js";
import type { AICompareFlightsInput } from "./ai.validation.js";

interface ComparableFlight {
  id: string;
  flightNumber: string;
  airline: {
    name: string | null;
    code: string | null;
  };
  departure: {
    airportCode: string | null;
    city: string | null;
    time: Date | string;
  };
  arrival: {
    airportCode: string | null;
    city: string | null;
    time: Date | string;
  };
  durationMinutes: number;
  stops: number;
  price: number;
  availableSeats: number;
  status: string;
}

export const compareFlights = async (
  input: AICompareFlightsInput
) => {
  const searchInput: FlightSearchInput = {
    origin: input.origin,
    destination: input.destination,
    departureDate: input.departureDate,
    passengers: input.passengers,
    travelClass: input.travelClass,
    page: 1,
    limit: 100
  };


  const result = await searchFlights(searchInput, {
    sortBy: "departure_asc"
  });

  const flights: ComparableFlight[] = result.flights
    .map((flight: any) => {
const cabin = flight.cabinClasses?.find(
  (item: any) =>
    item.class === input.travelClass &&
    item.availableSeats >= input.passengers
);

if (!cabin) return null;
      return {
        id: flight.id,
        flightNumber: flight.flightNumber,
        airline: {
          name: flight.airline?.name ?? null,
          code: flight.airline?.code ?? null
        },
        departure: flight.departure,
        arrival: flight.arrival,
        durationMinutes: flight.durationMinutes,
        stops: flight.stops,
        price: cabin.price,
        availableSeats: cabin.availableSeats,
        status: flight.status
      };
    })
    .filter(
      (flight: ComparableFlight | null): flight is ComparableFlight =>
        flight !== null
    );

  if (flights.length === 0) {
    return {
      success: true,
      message: "No flights found for comparison.",
      totalFlights: 0,
      comparisons: {
        cheapest: null,
        fastest: null,
        bestValue: null
      },
      aiRecommendation: null,
      flights: []
    };
  }


  const cheapest = [...flights].sort(
    (a, b) => a.price - b.price
  )[0];

 
  const fastest = [...flights].sort(
    (a, b) => a.durationMinutes - b.durationMinutes
  )[0];

  
  const prices = flights.map((flight) => flight.price);
  const durations = flights.map((flight) => flight.durationMinutes);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const getNormalizedScore = (value: number, min: number, max: number) =>
    max === min ? 0 : (value - min) / (max - min);

  const bestValue = [...flights].sort((a, b) => {
    const scoreA =
      getNormalizedScore(a.price, minPrice, maxPrice) * 0.6 +
      getNormalizedScore(a.durationMinutes, minDuration, maxDuration) * 0.4;

    const scoreB =
      getNormalizedScore(b.price, minPrice, maxPrice) * 0.6 +
      getNormalizedScore(b.durationMinutes, minDuration, maxDuration) * 0.4;

    return scoreA - scoreB;
  })[0];


  const prompt = `
You are SkyRoute AI, an expert flight comparison assistant.

Compare these actual flights retrieved from the SkyRoute database.

Journey:
${input.origin} to ${input.destination}

Departure date: ${input.departureDate}
Passengers: ${input.passengers}
Travel class: ${input.travelClass}

Actual available flights:
${JSON.stringify(flights, null, 2)}

Comparison:
Cheapest flight: ${cheapest.flightNumber}
Fastest flight: ${fastest.flightNumber}
Best value according to price (60%) and duration (40%):
${bestValue.flightNumber}

Instructions:
1. Recommend the most suitable flight based on price, duration and stops.
2. Explain why the recommendation is useful.
3. Mention cheaper or faster alternatives where relevant.
4. Use only the supplied flight information.
5. Never invent prices, airlines, timings or availability.
6. Do not claim that any flight has been booked.
7. Keep the response concise and easy to understand.
`;

  let aiRecommendation: string;

  try {
    aiRecommendation = await generateAIResponse(prompt);
  } catch (error) {
    console.error("[AI Compare] Gemini recommendation failed:", error);

    aiRecommendation =
      `Based on the available database results, ${bestValue.flightNumber} ` +
      `is the best-value option using a 60% price and 40% duration score. ` +
      `Compare its timings and stops before choosing.`;
  }

  return {
    success: true,
    message: "Flight comparison completed successfully.",
    totalFlights: flights.length,
    comparisons: {
      cheapest,
      fastest,
      bestValue
    },
    aiRecommendation,
    flights
  };
};
