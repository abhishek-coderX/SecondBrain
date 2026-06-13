import express from "express"
import { authMiddleware, AuthRequest } from "../middlewares/auth"
import { validate } from "../middlewares/validate"
import { shareSchema } from "../utils/zodSchema"
import link from "../model/link"
import user from "../model/user"
import content from "../model/content"

const shareRouter=express.Router()
shareRouter.post('/share', authMiddleware, validate(shareSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { contentIds } = req.body;
    const ownedContent = await content.find({
      _id: { $in: contentIds },
      userId,
    }).select("_id");

    if (ownedContent.length !== contentIds.length) {
      return res.status(403).json({ message: "You can only share your own content." });
    }

    const ownedContentIds = ownedContent.map((item) => item._id);

    let newlink = await link.findOne({ userId });
    if (!newlink) {
      newlink = new link({ userId, contents: ownedContentIds });
    } else {
      newlink.contents = ownedContentIds;
    }
    await newlink.save();
    
    return res.status(200).json({
      hash: newlink.hash,
    });
  } catch (error) {
    console.error("Error updating share settings:", error);
    res.status(500).json({ message: 'Server error.' });
  }
});


shareRouter.get('/share/:shareLink', async (req, res) => {
  try {
    const { shareLink } = req.params;

    const newLink = await link.findOne({ hash: shareLink });

    if (!newLink) {
      return res.status(404).json({ message: 'link is invalid or sharing is disabled.' });
    }

    const userData = await user.findById(newLink.userId);
    if (!userData) {
        return res.status(404).json({ message: 'user not be found.' });
    }

    const data = await content.find({ _id: { $in: newLink.contents } })
                                 .populate('tags', 'name')
                                 .sort({ createdAt: -1 });

    res.status(200).json({
      username: userData.username,
      content: data,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default shareRouter
