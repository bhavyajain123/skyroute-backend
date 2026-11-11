
import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

if (!env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const MAX_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 2000;
const REQUEST_TIMEOUT = 90000;

const RETRYABLE_STATUSES = new Set([
  429,
  500,
  502,
  503,
  504,
]);

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const apiError = error as {
    status?: number;
    code?: number;
  };

  const status = Number(apiError.status ?? apiError.code);

  return Number.isFinite(status) ? status : undefined;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithTimeout(prompt: string): Promise<string> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const response = await Promise.race([
     gemini.models.generateContent({
  model: env.GEMINI_MODEL,
  contents: prompt,
  config: {
    httpOptions: {
      timeout: REQUEST_TIMEOUT,
    },
  },
}),

      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Gemini request timed out after 30 seconds"));
        }, REQUEST_TIMEOUT);
      }),
    ]);

    const result = response.text?.trim();

    if (!result) {
      throw new Error("Gemini returned an empty response");
    }

    return result;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function generateAIResponse(
  prompt: string
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("AI prompt cannot be empty");
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[Gemini] Request attempt ${attempt}`);

      const result = await generateWithTimeout(cleanPrompt);

      console.log("[Gemini] Response received successfully");

      return result;
    } catch (error: unknown) {
      const status = getErrorStatus(error);

      const shouldRetry =
        status !== undefined && RETRYABLE_STATUSES.has(status);

      console.error(
        `[Gemini] Attempt ${attempt} failed:`,
        error
      );

      if (!shouldRetry || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const delay = INITIAL_RETRY_DELAY * 2 ** (attempt - 1);

      console.log(`[Gemini] Retrying after ${delay}ms`);

      await wait(delay);
    }
  }

  throw new Error("Gemini API request failed");
}
