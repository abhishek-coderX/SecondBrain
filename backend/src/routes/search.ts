import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Content from "../model/content";
import { getEmbedding, cosineSimilarity } from "../utils/embeddings";

const searchRouter = Router();

searchRouter.use(authMiddleware);

searchRouter.get("/search", async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.userId!;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // 1. Text search — regex match on title and description
    const textMatchDocs = await Content.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate("tags", "name")
      .populate("userId", "username");

    const textMatchIds = new Set(textMatchDocs.map((d: any) => d._id.toString()));

    // 2. Semantic search — only run if every word is >= 3 chars (skip partials)
    const words = query.trim().split(/\s+/);
    const shouldRunSemantic = words.every((w) => w.length >= 3);

    let semanticScoreMap = new Map<string, number>();

    if (shouldRunSemantic) {
      const queryEmbedding = await getEmbedding(query);

      const contentsWithEmbeddings = await Content.find({ userId })
        .select("+embedding")
        .populate("tags", "name")
        .populate("userId", "username");

      contentsWithEmbeddings.forEach((item: any) => {
        if (item.embedding && item.embedding.length > 0) {
          const score = cosineSimilarity(queryEmbedding, item.embedding);
          if (score > 0.6) {
            semanticScoreMap.set(item._id.toString(), score);
          }
        }
      });
    }

    // 3. Merge: build a scored map, deduplicating by _id
    //    Semantic score wins if present; text-only matches get score 0.8
    const mergedMap = new Map<string, any>();

    // Add semantic matches first
    if (shouldRunSemantic) {
      const contentsForMerge = await Content.find({ userId })
        .populate("tags", "name")
        .populate("userId", "username");

      contentsForMerge.forEach((item: any) => {
        const id = item._id.toString();
        const semanticScore = semanticScoreMap.get(id);
        if (semanticScore !== undefined) {
          const obj = item.toObject();
          delete obj.embedding;
          mergedMap.set(id, { ...obj, score: semanticScore });
        }
      });
    }

    // Add text matches not already in semantic results (score = 0.8)
    textMatchDocs.forEach((item: any) => {
      const id = item._id.toString();
      if (!mergedMap.has(id)) {
        const obj = item.toObject();
        delete obj.embedding;
        mergedMap.set(id, { ...obj, score: 0.8 });
      }
    });

    // 4. Sort by score descending, return top 5
    const results = Array.from(mergedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Hybrid search error:", error);
    res.status(500).json({ message: "Server error during search." });
  }
});

export default searchRouter;
