import {z} from "zod";
export const updateUserProfileSchema= z.object({

    firstName:z

      .string()

    .trim()
    .min (2,"first name must conation at least 2 chars")
    .max  (60)
    .optional(),

    lastName:z

    .string()
    .trim()
    .min(2,"last name must contaion atleast 2 chars")
    .max(60)  

    .optional(),

    phone:z 
      .string ()
    .trim ()

    .min(7)
    .max(20)
    .optional(),

    profileImage : z

    .string()
    .trim()
    .url("invalid profile image URL")
    .max(2048)
    .optional(),
}).strict().refine(
    (data)=> Object.keys(data).length>0,
    "at least one profile filed is required"
);  

export type UpdateUserProfileInput = z.infer <
  typeof  updateUserProfileSchema
  
>;