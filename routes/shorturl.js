import express from "express";
import { Url } from "../models/shorturl.js";
import { isAuthenticated } from "../controllers/auth.js";
import { getUserUrls,getUrlsCount } from "../controllers/shorturl.js";
const router = express.Router();

router.post("/create",isAuthenticated, async (req, res) => {
    try {
        const {  longUrl } = req.body; // Extract userId and longUrl from the request body
        const userId = req.user?._id;
        // if (!userId || !longUrl) {
        //   return res.status(400).json({ error: "Missing required fields: userId or longUrl" });
        // }
        const postedDate=new Date()
        const shortUrl = new Url({
          longUrl, 
          shortUrl: generateUrl(),
          date:postedDate, // Ensure `generateUrl()` exists and returns a unique value
          user:userId, // Reference to the user who created this URL
        });
    
        const savedUrl = await shortUrl.save();
        res.status(201).json({ message: "Short URL created successfully", data: savedUrl });
      } catch (error) {
        console.error("Error creating short URL:", error);
        res.status(500).json({ error: "Failed to create short URL" });
      }
    });



    router.get("/:urlId", async (req, res) => {
        try {
            const urlData = await Url.findOne({ shortUrl: req.params.urlId });
    console.log(urlData)
            if (!urlData) {
                return res.status(404).json({ error: "Short URL not found" });
            }
    
            // Increment click count and save it
            urlData.clickCount += 1;
            await urlData.save();
    
            // Only send one response: either redirect or an error message
            console.log("Redirecting to:", urlData.longUrl);
            return res.redirect(urlData.longUrl);
        } catch (error) {
            console.error("Error processing short URL:", error);
            // Handle only one response, avoiding double send
            return res.status(500).json({ error: "Failed to process short URL" });
        }
    });
// router.get("/:userId", async (req, res) => {
//     try {
//       const { userId } = req.params;
  
//       // Fetch all URLs created by the user
//       const userUrls = await Url.getUserUrls(userId);
  
//       if (!userUrls || userUrls.length === 0) {
//         return res.status(404).json({ error: "No URLs found for this user" });
//       }
  
//       res.json({ data: userUrls });
//     } catch (error) {
//       console.error("Error fetching user URLs:", error);
//       res.status(500).json({ error: "Failed to fetch URLs" });
//     }
//   }); 
router.get("/user/all",isAuthenticated,async(req,res)=>{
    try{
const Urls=await getUserUrls(req)
if(!Urls){
    return res.status(404).json({error:"no Urls available"})

}
res.status(200).json({data:Urls})
    }catch(err){
        console.log(err)
        res.status(500).json({error:"server error"})
    }
})
    const generateUrl = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let shortUrl = '';
        for (let i = 0; i < 6; i++) {
            shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return shortUrl; // Ensure this always returns a string
    };


export const urlRouter = router;


//.toJSON().slice(0,10)