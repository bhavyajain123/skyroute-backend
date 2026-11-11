import { generateAIResponse } from "../integrations/gemini/gemini.client.js";
export const generateTravelChatResponse= async(
    message:string,
    destination?:string
):Promise<string>=>{
    const prompt =`
    You are skyroute ai, an intelligent travel assistant.
    your job is to help users with flight travel, destinations,
    travel planning, baggage guidance and general travel questions.

    Destination:${destination|| "not specified"}
    User Question:
${message}

Instructions:
1. Give clear and helpful answers.
2. Keep responses relevant to travel.
3. Provide practical travel suggestions.
4. Never invent live flight prices or availability.
5. Never claim that a booking or payment has been completed.
6. If information is uncertain, clearly mention it.
7. Use a friendly and professional tone.
    `;

    const response =await generateAIResponse(prompt);
    if(!response.trim()){
        throw new Error("gemini returned an empty chat resposne");
    }
    return response;
};