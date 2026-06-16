import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Content from "../model/content";
import User from "../model/user";
import { getEmbedding, cosineSimilarity } from "../utils/embeddings";
import { decrypt } from "../utils/crypto";

const searchRouter = Router();

searchRouter.use(authMiddleware);

searchRouter.get("/search", async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.userId!;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const user = await User.findById(userId);
    let customApiKey: string | undefined;
    if (user?.geminiApiKey) {
      try {
        customApiKey = decrypt(user.geminiApiKey);
      } catch (err) {
        console.error("Failed to decrypt user API key, using server default key:", err);
      }
    }

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

    const words = query.trim().split(/\s+/);
    const shouldRunSemantic = words.every((w) => w.length >= 3);

    let semanticScoreMap = new Map<string, number>();

    let isSemanticOk = false;
    if (shouldRunSemantic) {
      try {
        const queryEmbedding = await getEmbedding(query, customApiKey);

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
        isSemanticOk = true;
      } catch (semErr: any) {
        console.error("⚠️ Semantic search failed, falling back to text-only search:", semErr?.message || semErr);
      }
    }

    const mergedMap = new Map<string, any>();

    if (isSemanticOk) {
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

    textMatchDocs.forEach((item: any) => {
      const id = item._id.toString();
      if (!mergedMap.has(id)) {
        const obj = item.toObject();
        delete obj.embedding;
        mergedMap.set(id, { ...obj, score: 0.8 });
      }
    });

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
