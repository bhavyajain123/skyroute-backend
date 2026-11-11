
import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { Airport } from "../airports/airport.model.js";
import { Airline } from "../airlines/airline.model.js";
import { Flight } from "../flights/flight.model.js";

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();

    console.log("Starting SkyRoute database seeding...");


const airportData = [
  
  {
    name: "Indira Gandhi International Airport",
    iataCode: "DEL",
    icaoCode: "VIDP",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 28.5562, longitude: 77.1000 },
    isActive: true
  },
  {
    name: "Chhatrapati Shivaji Maharaj International Airport",
    iataCode: "BOM",
    icaoCode: "VABB",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 19.0896, longitude: 72.8656 },
    isActive: true
  },
  {
    name: "Kempegowda International Airport",
    iataCode: "BLR",
    icaoCode: "VOBL",
    city: "Bengaluru",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 13.1986, longitude: 77.7066 },
    isActive: true
  },
  {
    name: "Rajiv Gandhi International Airport",
    iataCode: "HYD",
    icaoCode: "VOHS",
    city: "Hyderabad",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 17.2403, longitude: 78.4294 },
    isActive: true
  },
  {
    name: "Chennai International Airport",
    iataCode: "MAA",
    icaoCode: "VOMM",
    city: "Chennai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 12.9941, longitude: 80.1709 },
    isActive: true
  },
  {
    name: "Netaji Subhas Chandra Bose International Airport",
    iataCode: "CCU",
    icaoCode: "VECC",
    city: "Kolkata",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 22.6547, longitude: 88.4467 },
    isActive: true
  },
  {
    name: "Manohar International Airport",
    iataCode: "GOX",
    icaoCode: "VOGA",
    city: "Goa",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 15.7443, longitude: 73.8606 },
    isActive: true
  },
  {
    name: "Pune Airport",
    iataCode: "PNQ",
    icaoCode: "VAPO",
    city: "Pune",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 18.5822, longitude: 73.9197 },
    isActive: true
  },
  {
    name: "Jaipur International Airport",
    iataCode: "JAI",
    icaoCode: "VIJP",
    city: "Jaipur",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 26.8242, longitude: 75.8122 },
    isActive: true
  },
  {
    name: "Cochin International Airport",
    iataCode: "COK",
    icaoCode: "VOCI",
    city: "Kochi",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 10.1520, longitude: 76.4019 },
    isActive: true
  },
  {
    name: "Chaudhary Charan Singh International Airport",
    iataCode: "LKO",
    icaoCode: "VILK",
    city: "Lucknow",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 26.7606, longitude: 80.8893 },
    isActive: true
  },

  
  {
    name: "Dubai International Airport",
    iataCode: "DXB",
    icaoCode: "OMDB",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
    isActive: true
  },
  {
    name: "Zayed International Airport",
    iataCode: "AUH",
    icaoCode: "OMAA",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    coordinates: { latitude: 24.4330, longitude: 54.6511 },
    isActive: true
  },
  {
    name: "Singapore Changi Airport",
    iataCode: "SIN",
    icaoCode: "WSSS",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
    coordinates: { latitude: 1.3644, longitude: 103.9915 },
    isActive: true
  },
  {
    name: "London Heathrow Airport",
    iataCode: "LHR",
    icaoCode: "EGLL",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    coordinates: { latitude: 51.4700, longitude: -0.4543 },
    isActive: true
  },
  {
    name: "John F. Kennedy International Airport",
    iataCode: "JFK",
    icaoCode: "KJFK",
    city: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    coordinates: { latitude: 40.6413, longitude: -73.7781 },
    isActive: true
  },
  {
    name: "Paris Charles de Gaulle Airport",
    iataCode: "CDG",
    icaoCode: "LFPG",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris",
    coordinates: { latitude: 49.0097, longitude: 2.5479 },
    isActive: true
  },
  {
    name: "Suvarnabhumi Airport",
    iataCode: "BKK",
    icaoCode: "VTBS",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    timezone: "Asia/Bangkok",
    coordinates: { latitude: 13.6900, longitude: 100.7501 },
    isActive: true
  },
  {
    name: "Kuala Lumpur International Airport",
    iataCode: "KUL",
    icaoCode: "WMKK",
    city: "Kuala Lumpur",
    country: "Malaysia",
    countryCode: "MY",
    timezone: "Asia/Kuala_Lumpur",
    coordinates: { latitude: 2.7456, longitude: 101.7072 },
    isActive: true
  },
  {
    name: "Hamad International Airport",
    iataCode: "DOH",
    icaoCode: "OTHH",
    city: "Doha",
    country: "Qatar",
    countryCode: "QA",
    timezone: "Asia/Qatar",
    coordinates: { latitude: 25.2731, longitude: 51.6081 },
    isActive: true
  },
  {
    name: "Frankfurt Airport",
    iataCode: "FRA",
    icaoCode: "EDDF",
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    coordinates: { latitude: 50.0379, longitude: 8.5622 },
    isActive: true
  }
];


const airports = await Promise.all(
  airportData.map((airport) =>
    Airport.findOneAndUpdate(
      { iataCode: airport.iataCode },
      { $set: airport },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    )
  )
);

console.log(`${airports.length} airports ready.`);

    console.log(`${airports.length} airports inserted.`);

    

const airlineData = [
  {
    name: "Air India",
    iataCode: "AI",
    icaoCode: "AIC",
    country: "India",
    isActive: true
  },
  {
    name: "IndiGo",
    iataCode: "6E",
    icaoCode: "IGO",
    country: "India",
    isActive: true
  },
  {
    name: "Vistara",
    iataCode: "UK",
    icaoCode: "VTI",
    country: "India",
    isActive: true
  },
  {
    name: "Akasa Air",
    iataCode: "QP",
    icaoCode: "AKJ",
    country: "India",
    isActive: true
  },
  {
    name: "Emirates",
    iataCode: "EK",
    icaoCode: "UAE",
    country: "United Arab Emirates",
    isActive: true
  },
  {
    name: "Qatar Airways",
    iataCode: "QR",
    icaoCode: "QTR",
    country: "Qatar",
    isActive: true
  },
  {
    name: "Singapore Airlines",
    iataCode: "SQ",
    icaoCode: "SIA",
    country: "Singapore",
    isActive: true
  },
  {
    name: "British Airways",
    iataCode: "BA",
    icaoCode: "BAW",
    country: "United Kingdom",
    isActive: true
  },
  {
    name: "Lufthansa",
    iataCode: "LH",
    icaoCode: "DLH",
    country: "Germany",
    isActive: true
  },
  {
    name: "Thai Airways",
    iataCode: "TG",
    icaoCode: "THA",
    country: "Thailand",
    isActive: true
  }
];

const airlines = await Promise.all(
  airlineData.map((airline) =>
    Airline.findOneAndUpdate(
      { iataCode: airline.iataCode },
      { $set: airline },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    )
  )
);

console.log(`${airlines.length} airlines ready.`);


    console.log(`${airlines.length} airlines inserted.`);

    
   

   

const flightRoutes = [
  // Domestic routes
  ["DEL", "BOM"],
  ["BOM", "DEL"],
  ["DEL", "BLR"],
  ["BLR", "DEL"],
  ["DEL", "HYD"],
  ["HYD", "DEL"],
  ["BOM", "BLR"],
  ["BLR", "BOM"],
  ["DEL", "MAA"],
  ["MAA", "DEL"],
  ["DEL", "CCU"],
  ["CCU", "DEL"],
  ["BLR", "BOM"],
  ["BOM", "HYD"],
  ["BLR", "HYD"],
  ["MAA", "BLR"],
  ["CCU", "BOM"],
  ["DEL", "GOX"],
  ["BOM", "GOX"],
  ["DEL", "PNQ"],
  ["DEL", "JAI"],
  ["DEL", "COK"],
  ["DEL", "LKO"],

  // International routes from India
  ["DEL", "DXB"],
  ["DXB", "DEL"],
  ["BOM", "DXB"],
  ["DXB", "BOM"],
  ["DEL", "AUH"],
  ["AUH", "DEL"],
  ["BOM", "SIN"],
  ["SIN", "BOM"],
  ["BLR", "SIN"],
  ["SIN", "BLR"],
  ["DEL", "LHR"],
  ["LHR", "DEL"],
  ["DEL", "JFK"],
  ["JFK", "DEL"],
  ["DEL", "CDG"],
  ["CDG", "DEL"],
  ["BLR", "BKK"],
  ["BKK", "BLR"],
  ["MAA", "KUL"],
  ["KUL", "MAA"],
  ["HYD", "DOH"],
  ["DOH", "HYD"],
  ["BOM", "FRA"],
  ["FRA", "BOM"],

  ["DXB", "LHR"],
  ["LHR", "DXB"],
  ["SIN", "BKK"],
  ["BKK", "SIN"],
  ["DOH", "CDG"],
  ["CDG", "DOH"]
] as const;



const airportMap = new Map(
  airports.map((airport) => [airport.iataCode, airport])
);

const departureHours = [7, 13, 19];

const indiaToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata"
}).format(new Date());

function localDateTimeToUtc(
  dateString: string,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const [year, month, day] = dateString.split("-").map(Number);

  const utcGuess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  const parts = formatter.formatToParts(new Date(utcGuess));

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  const localAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute)
  );

  const offset = localAsUtc - utcGuess;

  return new Date(utcGuess - offset);
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

const generatedFlights: any[] = [];

for (let day = 0; day < 30; day++) {
  const travelDate = new Date(`${indiaToday}T00:00:00Z`);
  travelDate.setUTCDate(travelDate.getUTCDate() + day);

  const dateString = travelDate.toISOString().slice(0, 10);

  for (let routeIndex = 0; routeIndex < flightRoutes.length; routeIndex++) {
    const route = flightRoutes[routeIndex];

    const departureAirport = airportMap.get(route[0]);
    const arrivalAirport = airportMap.get(route[1]);

    if (!departureAirport || !arrivalAirport) {
      throw new Error(`Airport missing for route ${route.join(" -> ")}`);
    }

    if (!departureAirport.coordinates || !arrivalAirport.coordinates) {
      throw new Error(`Coordinates missing for route ${route.join(" -> ")}`);
    }

    const distance = calculateDistanceKm(
      departureAirport.coordinates.latitude,
      departureAirport.coordinates.longitude,
      arrivalAirport.coordinates.latitude,
      arrivalAirport.coordinates.longitude
    );

    // Estimated duration: cruising speed + ground/takeoff allowance
    const durationMinutes = Math.round((distance / 750) * 60 + 40);

    for (let slotIndex = 0; slotIndex < departureHours.length; slotIndex++) {
      const hour = departureHours[slotIndex];

      const departureTime = localDateTimeToUtc(
        dateString,
        hour,
        0,
        departureAirport.timezone || "UTC"
      );

      const arrivalTime = new Date(
        departureTime.getTime() + durationMinutes * 60_000
      );

      const airline = airlines[
        (routeIndex + slotIndex) % airlines.length
      ];

      const flightNumber =
        `${airline.iataCode}${200 + routeIndex * 3 + slotIndex}`;

      generatedFlights.push({
        flightNumber,
        airline: airline._id,
        departureAirport: departureAirport._id,
        arrivalAirport: arrivalAirport._id,
        departureTime,
        arrivalTime,
        durationMinutes,
        aircraft: distance > 5000 ? "Boeing 787 Dreamliner" : "Airbus A320",
        stops: 0,

cabinClasses: [
  {
    class: "economy",
    totalSeats: 180,
    availableSeats: 150,
    price: Math.round(3500 + distance * 4 + slotIndex * 500),

    baggage: {
      cabinBaggageKg: 7,
      checkInBaggageKg: 15,
    },

    farePolicy: {
      refundable: false,
      freeCancellation: false,
      cancellationFee: 3500,
      freeSeatSelection: false,
      mealIncluded: false,
    },
  },

  {
    class: "premium_economy",
    totalSeats: 30,
    availableSeats: 25,
    price: Math.round(6500 + distance * 5 + slotIndex * 500),

    baggage: {
      cabinBaggageKg: 7,
      checkInBaggageKg: 20,
    },

    farePolicy: {
      refundable: true,
      freeCancellation: false,
      cancellationFee: 2000,
      freeSeatSelection: true,
      mealIncluded: true,
    },
  },

  {
    class: "business",
    totalSeats: 20,
    availableSeats: 15,
    price: Math.round(14000 + distance * 7 + slotIndex * 1000),

    baggage: {
      cabinBaggageKg: 10,
      checkInBaggageKg: 30,
    },

    farePolicy: {
      refundable: true,
      freeCancellation: true,
      cancellationFee: 0,
      freeSeatSelection: true,
      mealIncluded: true,
    },
  },
],

        status: "scheduled",
        isActive: true
      });
    }
  }
}


const operations = generatedFlights.map((flight) => ({
  updateOne: {
    filter: {
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime
    },
    update: {
      $set: flight
    },
    upsert: true
  }
}));

const result = await Flight.bulkWrite(operations);

console.log(`${result.upsertedCount} new flights inserted.`);
console.log(`${result.modifiedCount} existing flights updated.`);
console.log(`${generatedFlights.length} total flights processed.`);
console.log("SkyRoute database seeding completed!");

    console.log("SkyRoute database seeding completed!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedDatabase();
