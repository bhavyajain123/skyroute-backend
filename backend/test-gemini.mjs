import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-3.5-flash-lite";

console.log("API key configured:", Boolean(apiKey));
console.log("Model:", model);

const ai = new GoogleGenAI({ apiKey });

try {
  console.log("Testing Gemini API with 90-second timeout...");

  const response = await ai.models.generateContent({
    model,
    contents: "Reply with exactly: SkyRoute Gemini working",
    config: {
      httpOptions: { timeout: 90000 },
      maxOutputTokens: 32
    }
  });

  console.log("SUCCESS:", response.text);
} catch (error) {
  console.error("GEMINI ERROR:", error);
  process.exitCode = 1;
}


