import type {Request, Response} from "express";
import { aiChatSchema } from "./ai-chat.validation.js";
import { generateTravelChatResponse } from "./ai-chat.service.js";

export const getAIChatResponse= async(
    req:Request,
    res:Response
):Promise<void>=>{
    try{
        const validation =aiChatSchema.safeParse(req.body);
        if(!validation.success){
            res.status(400).json({
                success:false,
                message:"invalid chat request",
                errors: validation.error.flatten()
            });
            return;
        }
        const { message, destination } = validation.data;
        const response= await generateTravelChatResponse(
            message,destination
        );
        res.status(200).json({
            success:true,
            message:"ai response generated successfullly",
            data:{
                reply:response
            }
        });
    } catch (error) {
  console.error("AI Chat Error:", error);

  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : 500;

  res.status(status === 503 ? 503 : 500).json({
    success: false,
    message:
      status === 503
        ? "AI service is temporarily unavailable. Please try again later."
        : "Unable to generate AI response.",
    errorCode: status || 500
  });
}
};