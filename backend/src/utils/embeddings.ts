import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Generate an embedding vector for the given text.
 * Uses Gemini gemini-embedding-2 (3072 dimensions).
 *
 * @param text - The text to embed
 * @returns A number array (vector) of 3072 dimensions
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  // Truncate very long text to stay within token limits
  const truncated = text.slice(0, 24000);

  let attempts = 3;
  let delay = 1000;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: truncated,
      });

      return result.embeddings![0].values!;
    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.status === 429 || 
                          error?.message?.includes("503") || error?.message?.includes("429");
      if (isRetryable && i < attempts - 1) {
        console.warn(`⏳ Gemini busy (Attempt ${i + 1}/${attempts}), retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      console.error("❌ Embedding error:", error?.message || error);
      throw error;
    }
  }
  throw new Error("Failed to generate embedding after multiple attempts");
}

/**
 * Build a combined text string from content fields for embedding.
 * Concatenates title + description + link for maximum semantic coverage.
 */
export function buildEmbeddingText(content: {
  title: string;
  description?: string;
  link?: string;
  type?: string;
}): string {
  const parts = [content.title];
  if (content.description) parts.push(content.description);
  if (content.link) parts.push(content.link);
  if (content.type) parts.push(`Content type: ${content.type}`);
  return parts.join(" ");
}

/**
 * Helper function to calculate cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

