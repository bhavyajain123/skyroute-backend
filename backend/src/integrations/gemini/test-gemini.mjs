
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

if (!apiKey || !model) {
  throw new Error("Gemini configuration missing");
}

const ai = new GoogleGenAI({ apiKey });

try {
  console.log("Model:", model);
  console.log("Testing Gemini API with 90-second timeout...");

  const response = await ai.models.generateContent({
    model,
    contents: "Reply with exactly: SkyRoute Gemini working",
    config: {
      httpOptions: {
        timeout: 90000,
      },
      maxOutputTokens: 32,
    },
  });

  console.log("SUCCESS!");
  console.log("Response:", response.text);
} catch (error) {
  console.error("GEMINI ERROR:");
  console.error(error);
  process.exitCode = 1;
}
