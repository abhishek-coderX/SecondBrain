import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createContentSchema } from "../utils/zodSchema";
import Content from "../model/content";
// import Tag from '../model/tag';

const contentRouter = Router();

contentRouter.use(authMiddleware);

contentRouter.post(
  "/content",
  validate(createContentSchema),
  async (req: AuthRequest, res) => {
    try {
      const { title, type, link, tags } = req.body;
      const userId = req.userId!;

    //   const userTags = await Tag.find({ _id: { $in: tags }, userId });
    //   if (userTags.length !== tags.length) {
    //     return res
    //       .status(400)
    //       .json({
    //         message: "One or more tags are invalid or do not belong to you.",
    //       });
    //   }

      const newContent = new Content({
        title,
        type,
        link,
        tags: tags || [],
        userId,
      });

      const savedContent = await newContent.save();

      res.status(201).json({ message: "content added successfully" });
    } catch (error) {
      if ((error as any).code === 11000) {
        return res.status(409).json({ message: "Duplicate title." });
      }
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
