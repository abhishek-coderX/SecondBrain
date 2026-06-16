import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createContentSchema, updateContentSchema } from "../utils/zodSchema";
import Content from "../model/content";
import Tag from '../model/tag';
import User from "../model/user";
import { getEmbedding, buildEmbeddingText } from "../utils/embeddings";
import { decrypt } from "../utils/crypto";
import ogs from "open-graph-scraper";

const contentRouter = Router();

contentRouter.use(authMiddleware);

contentRouter.post(
  "/content",
  validate(createContentSchema),
  async (req: AuthRequest, res) => {
    try {
      const { title, type, link, tags, description, thumbnail } = req.body;
      const userId = req.userId!;

      const tagIds = await Promise.all(
        (tags || []).map(async (tagName: string) => {
          const name = tagName.toLowerCase().trim();
          let tag = await Tag.findOne({ name, userId });
          if (!tag) {
            tag = new Tag({ name, userId });
            await tag.save();
          }
          return tag._id;
        })
      );

      const newContent = new Content({
        title, type, link, description, thumbnail,
        tags: tagIds, 
        userId,
      });

      const savedContent = await newContent.save();

      const populatedContent = await Content.findById(savedContent._id)
        .populate("userId", "username")
        .populate("tags", "name");

      res.status(201).json(populatedContent);

      // Generate embedding in background (don't block response)
      (async () => {
        try {
          const user = await User.findById(userId);
          let customApiKey: string | undefined;
          if (user?.geminiApiKey) {
            try {
              customApiKey = decrypt(user.geminiApiKey);
            } catch (err) {
              console.error("Failed to decrypt user API key, using server default key:", err);
            }
          }
          const embeddingText = buildEmbeddingText({ title, description, link, type });
          const embedding = await getEmbedding(embeddingText, customApiKey);
          await Content.findByIdAndUpdate(savedContent._id, { embedding });
          console.log(`🧠 Embedding generated for: "${title}"`);
        } catch (embErr) {
          console.error(`⚠️ Failed to generate embedding for: "${title}"`, embErr);
        }
      })();

      // Scrape OG thumbnail in background — only for articles with a link
      if (type === "article" && link) {
        (async () => {
          try {
            console.log(`🖼️  OG scrape starting for: "${title}" → ${link}`);
            const { result } = await ogs({ url: link, timeout: 5000 });
            const imageUrl = result.ogImage?.[0]?.url;
            console.log(`🖼️  OG scrape result for: "${title}" → imageUrl=${imageUrl ?? "none"}`);
            if (imageUrl) {
              await Content.findByIdAndUpdate(savedContent._id, { thumbnail: imageUrl });
              console.log(`✅ Thumbnail saved for: "${title}"`);
            }
          } catch (ogErr: any) {
            console.error(`⚠️ OG scrape failed for: "${title}" →`, ogErr?.message ?? ogErr);
          }
        })();
      }

    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Server error while creating content." });
    }
  }
);

contentRouter.get("/content", async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const contents = await Content.find({ userId })
      .populate("userId", "username")
      .populate("tags", "name") 
      .sort({ createdAt: -1 });
    res.status(200).json(contents);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching content." });
  }
});


contentRouter.put("/content/:id", validate(updateContentSchema), async (req: AuthRequest, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.userId;
    const updateData = req.body;

    const content = await Content.findOne({ _id: contentId, userId });
    if (!content) {
      return res.status(404).json({ message: "Content not found." });
    }

    if (updateData.tags !== undefined) {
      const tagIds = await Promise.all(
        (updateData.tags || []).map(async (tagName: string) => {
          const name = tagName.toLowerCase().trim();
          let tag = await Tag.findOne({ name, userId });
          if (!tag) {
            tag = new Tag({ name, userId });
            await tag.save();
          }
          return tag._id;
        })
      );
      updateData.tags = tagIds;
    }

    const updatedContent = await Content.findOneAndUpdate(
      { _id: contentId, userId },
      { $set: updateData },
      { new: true }
    )
      .populate("userId", "username")
      .populate("tags", "name");

    res.status(200).json(updatedContent);

    // Regenerate embedding in background if semantic fields changed
    const { title, description, link, type } = req.body;
    if (title || description || link || type) {
      (async () => {
        try {
          const user = await User.findById(userId);
          let customApiKey: string | undefined;
          if (user?.geminiApiKey) {
            try {
              customApiKey = decrypt(user.geminiApiKey);
            } catch (err) {
              console.error("Failed to decrypt user API key, using server default key:", err);
            }
          }
          const current = updatedContent as any;
          const embeddingText = buildEmbeddingText({
            title: current.title,
            description: current.description,
            link: current.link,
            type: current.type,
          });
          const embedding = await getEmbedding(embeddingText, customApiKey);
          await Content.findByIdAndUpdate(contentId, { embedding });
          console.log(`Embedding regenerated for: "${current.title}"`);
        } catch (embErr) {
          console.error(`Failed to regenerate embedding`, embErr);
        }
      })();
    }
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ message: "Server error while updating content." });
  }
});

contentRouter.delete("/content/:id", async (req: AuthRequest, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.userId;

    const result = await Content.deleteOne({ _id: contentId, userId: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Content not found." });
    }

    res.status(200).json({ message: "Content deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting content." });
  }
});

export default contentRouter;
