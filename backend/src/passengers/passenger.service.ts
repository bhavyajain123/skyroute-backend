
import { Types } from "mongoose";
import { Passenger } from "./passenger.model.js";
import type {
  CreatePassengerInput,
  UpdatePassengerInput,

}  from "./passenger.validation.js";

function getObjectId (id:  string, error: string): Types.ObjectId {
  if ( !Types.ObjectId.isValid(id )) {

    throw new Error(error);

  }
  return new Types.ObjectId(id);
}


export async function createPassenger(
  userId: string,
  input: CreatePassengerInput
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");

  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();


  const existingPassenger = await Passenger.findOne({
    userId: userObjectId,
    email,
    phone,
  });

  if (existingPassenger) {
    return existingPassenger;
  }

 
  const passenger = await Passenger.create({
    ...input,
    email,
    phone,
    userId: userObjectId,
  });

  return passenger;
}


export async function getMyPassenger(userId: string) {
  const userObjectId = getObjectId(userId, "invalid_user_id");

  return Passenger.find({
    userId: userObjectId,
  })

     .select("-__v")
    .sort({ createdAt: -1 });
}


export async function updatePassenger(
  userId: string,
  passengerId: string,
  input: UpdatePassengerInput
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");
  const passengerObjectId = getObjectId(
    passengerId,
    "invalid_passenger_id"
  );

  const passenger =await Passenger.findOne({

    _id: passengerObjectId,
    userId: userObjectId,
  }) ;

  if (!passenger){
    throw new Error("passenger_not_found");
  }

  const passportNumber =
     input.passportNumber !== undefined

      ?  input.passportNumber

      : passenger.passportNumber;

  const passportExpiry =
    input.passportExpiry !==undefined
    
      ? input.passportExpiry
      : passenger.passportExpiry;

  if (passportExpiry && !passportNumber) {
    throw new Error("passport_number_required");
  }

  if (passportNumber && !passportExpiry) {
    throw new Error("passport_expiry_required");
  }

  if (passportExpiry && passportExpiry <= new Date()) {
    throw new Error("passport_expired");
  }

  Object.assign(passenger, input);

  await passenger.save();

  return passenger;
}


export async function deletePassenger(
  userId: string,
  passengerId: string
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");
  const passengerObjectId = getObjectId(
    passengerId,
    "invalid_passenger_id"
  );

  const passenger = await Passenger.findOneAndDelete({
    _id: passengerObjectId,
    userId: userObjectId,
  });

  if (!passenger) {

    throw new Error("passenger_not_found");
  }

   return passenger;
}
