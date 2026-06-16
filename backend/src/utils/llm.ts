import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Generate an answer using Gemini, grounded by the provided system instruction.
 * The caller is responsible for building the full systemInstruction string
 * (including context, rules, and any override behaviour).
 *
 * @param question          - The user's query
 * @param systemInstruction - The complete system prompt (including context)
 * @param useWebSearch      - Whether to enable Google Search grounding
 * @param customApiKey      - Optional custom API key override
 */
export async function generateAnswer(
  question: string,
  systemInstruction: string,
  useWebSearch: boolean = false,
  customApiKey?: string
): Promise<{ text: string; groundingChunks?: any[] }> {
  if (!question || question.trim().length === 0) {
    throw new Error("Question cannot be empty");
  }

  const aiInstance = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : ai;

  let attempts = 3;
  let delay = 1000;

  for (let i = 0; i < attempts; i++) {
    try {
      const config: any = {
        systemInstruction,
        temperature: 0.4,
      };

      if (useWebSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: question,
        config,
      });

      const text = response.text || "No response generated.";
      const groundingChunks = response.candidates?.[0]
        ?.groundingMetadata?.groundingChunks || [];

      return { text, groundingChunks };
    } catch (error: any) {
      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("503") ||
        error?.message?.includes("429");

      if (isRetryable && i < attempts - 1) {
        console.warn(`⏳ Gemini busy (Attempt ${i + 1}/${attempts}), retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      console.error("❌ LLM Generation error:", error?.message || error);
      throw error;
    }
  }
  throw new Error("Failed after multiple attempts");
}
