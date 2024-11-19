import express from "express";

import { getUserUrls,getUrlsCount } from "../controllers/shorturl.js";
const router = express.Router();

router.get('/count', getUrlsCount); 

export const countRouter = router;
