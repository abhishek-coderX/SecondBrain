import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import User from "../model/user";
import { encrypt } from "../utils/crypto";

const settingsRouter = Router();

settingsRouter.use(authMiddleware);

// GET /settings/api-key - Check if user has registered a custom API key
settingsRouter.get("/settings/api-key", async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId);
    res.status(200).json({ hasCustomKey: !!user?.geminiApiKey });
  } catch (error) {
    console.error("GET /settings/api-key error:", error);
    res.status(500).json({ message: "Server error while fetching API key settings." });
  }
});

// POST /settings/api-key - Save custom API key (encrypted)
settingsRouter.post("/settings/api-key", async (req: AuthRequest, res) => {
  try {
    const { geminiApiKey } = req.body;
    const userId = req.userId!;

    if (!geminiApiKey || geminiApiKey.trim().length === 0) {
      return res.status(400).json({ message: "API key is required." });
    }

    const encryptedKey = encrypt(geminiApiKey.trim());
    await User.findByIdAndUpdate(userId, { geminiApiKey: encryptedKey });

    res.status(200).json({ message: "API key saved successfully." });
  } catch (error) {
    console.error("POST /settings/api-key error:", error);
    res.status(500).json({ message: "Server error while saving API key." });
  }
});

// DELETE /settings/api-key - Remove custom API key
settingsRouter.delete("/settings/api-key", async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    await User.findByIdAndUpdate(userId, { $unset: { geminiApiKey: 1 } });
    res.status(200).json({ message: "API key removed successfully." });
  } catch (error) {
    console.error("DELETE /settings/api-key error:", error);
    res.status(500).json({ message: "Server error while removing API key." });
  }
});

export default settingsRouter;
