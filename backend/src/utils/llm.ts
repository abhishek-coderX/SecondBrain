import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Generate an answer using Gemini, grounded by the provided system instruction.
 * The caller is responsible for building the full systemInstruction string
 * (including context, rules, and any override behaviour).
 *
 * @param question          - The user's query
 * @param systemInstruction - The complete system prompt (including context)
 */
export async function generateAnswer(
  question: string,
  systemInstruction: string
): Promise<string> {
  if (!question || question.trim().length === 0) {
    throw new Error("Question cannot be empty");
  }

  let attempts = 3;
  let delay = 1000;

  for (let i = 0; i < attempts; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      return response.text || "No response generated.";
    } catch (error: any) {
      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("503") ||
        error?.message?.includes("429");

      if (isRetryable && i < attempts - 1) {
        console.warn(
          `⏳ Gemini busy (Attempt ${i + 1}/${attempts}), retrying in ${delay / 1000}s...`
        );
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      console.error("❌ LLM Generation error:", error?.message || error);
      throw error;
    }
  }

  throw new Error("Failed to generate content after multiple attempts");
}
