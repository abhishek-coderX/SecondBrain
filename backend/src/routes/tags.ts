import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Tag from "../model/tag";

const tagRouter = Router();

tagRouter.use(authMiddleware);

tagRouter.get("/tags", async (req: AuthRequest, res) => {
  try {
    const tags = await Tag.find({ userId: req.userId }).sort({ name: 1 });
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching tags." });
  }
});

export default tagRouter;