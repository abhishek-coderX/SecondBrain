import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Content from "../model/content";
import { getEmbedding, cosineSimilarity } from "../utils/embeddings";
import { generateAnswer } from "../utils/llm";

const askRouter = Router();

askRouter.use(authMiddleware);

askRouter.post("/ask", async (req: AuthRequest, res) => {
  try {
    const { question } = req.body;
    const userId = req.userId!;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required." });
    }

    // 1. Get embedding for the user's question
    const queryEmbedding = await getEmbedding(question);

    // 2. Fetch all user content with embeddings
    const contents = await Content.find({ userId })
      .select("+embedding")
      .populate("tags", "name")
      .populate("userId", "username");

    // 3. Compute cosine similarity scores
    const scoredContents = contents
      .map((item: any) => {
        const itemObj = item.toObject();
        const similarity =
          item.embedding && item.embedding.length > 0
            ? cosineSimilarity(queryEmbedding, item.embedding)
            : 0;
        delete itemObj.embedding;
        return { ...itemObj, score: similarity };
      })
      .filter((item) => item.score > 0.6)
      .sort((a, b) => b.score - a.score);

    // 4. Retrieve top 3, prune to dominant result if gap > 0.15
    let topMatches = scoredContents.slice(0, 3);
    if (topMatches.length >= 2 && topMatches[0].score - topMatches[1].score > 0.15) {
      topMatches = [topMatches[0]];
    }

    // 5. Build lean context string (title + type + description only)
    const contextString = topMatches
      .map((item, idx) => {
        return `[Source ${idx + 1}]\nTitle: ${item.title}\nType: ${item.type}\nDescription: ${item.description || "N/A"}`;
      })
      .join("\n\n");

    // 6. Single unified system instruction — Gemini handles all cases naturally
    const systemInstruction = `You are SecondBrain AI, a helpful personal knowledge assistant.

You have access to the user's saved content as context below.

Rules:
1. If the context contains relevant information, use it to answer and cite sources inline like (Source: title).
2. If the context is not relevant or empty, answer from your general knowledge naturally.
3. For greetings or casual messages, respond naturally and briefly like a friendly assistant.
4. For questions outside the brain context, just answer helpfully.
5. Never say "I don't have this in your SecondBrain" — just answer or ask for clarification.
6. Never mention tags, raw URLs, or internal metadata in your response.
7. Cite sources only by their title like (Source: title). Keep answers concise and conversational.

Context from user's SecondBrain:
${contextString || "No relevant content found for this query."}`;

    // 7. Generate answer
    const answer = await generateAnswer(question, systemInstruction);

    // 8. Return answer and pruned reference cards
    res.status(200).json({
      answer,
      references: topMatches,
    });
  } catch (error) {
    console.error("❌ Ask SecondBrain error:", error);
    res.status(500).json({ message: "Server error while processing request." });
  }
});

export default askRouter;
