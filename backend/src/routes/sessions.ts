import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import ChatSession from "../model/chatSession";

const sessionRouter = Router();
sessionRouter.use(authMiddleware);

// Get all sessions for sidebar
sessionRouter.get("/sessions", async (req: AuthRequest, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions" });
  }
});

// Create new session
sessionRouter.post("/sessions", async (req: AuthRequest, res) => {
  try {
    const session = new ChatSession({
      userId: req.userId,
      title: "New Chat",
      messages: []
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error creating session" });
  }
});

// Get single session with all messages
sessionRouter.get("/sessions/:id", async (req: AuthRequest, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session" });
  }
});

// Delete session
sessionRouter.delete("/sessions/:id", async (req: AuthRequest, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting session" });
  }
});

export default sessionRouter;
