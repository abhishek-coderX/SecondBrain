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
    const { share } = req.body;

    if (share) {
      let newlink = await link.findOne({ userId });
      if (!newlink) {
        newlink = new link({ userId });
        await newlink.save();
      }
      const shareableLink = `${req.protocol}://${req.get('host')}/share/${newlink.hash}`;
      return res.status(200).json({
        link: shareableLink,
      });

    } else {
      await link.deleteOne({ userId });
      return res.status(200).json({ message: 'Sharing  disabled.' });
    }
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

    const data = await content.find({ userId: newLink.userId })
                                //  .populate('tags', 'title')
                                //  .sort({ createdAt: -1 });

    const formattedContent = data.map(item => ({
        id: item._id,
        type: item.type,
        link: item.link,
        title: item.title,
        // tags: item.tags.map((tag: any) => tag.title) 
    }));

    res.status(200).json({
      username: userData.username,
      content: formattedContent,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default shareRouter