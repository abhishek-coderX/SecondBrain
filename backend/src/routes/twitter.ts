import { Router } from "express";
import axios from "axios";

const twitterRouter = Router();

twitterRouter.get("/twitter/oembed", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "URL required" });

    const response = await axios.get(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url as string)}&omit_script=true&hide_thread=true`
    );

    res.json({ html: response.data.html });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch tweet" });
  }
});

export default twitterRouter;
