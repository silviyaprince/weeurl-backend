import express from "express";

import { getUserUrls,getUrlsCount } from "../controllers/shorturl.js";
const router = express.Router();

router.get('/count', async (req, res) => {
    try {
      const counts = await getUrlsCount();
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export const countRouter = router;
