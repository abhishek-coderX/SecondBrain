import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createContentSchema } from "../utils/zodSchema";
import Content from "../model/content";
import Tag from '../model/tag';

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
