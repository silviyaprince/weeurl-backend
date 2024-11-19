import { Url } from "../models/shorturl.js";

export function getUserUrls(req){
    return Url.find({user:req.user._id}).populate("user","username email")
}



export const getUrlsCount = async () => {
  try {
    const dailyCount = await Url.aggregate([
      {
        $group: {
          _id: "$date", // Group by the 'date' field
          count: { $sum: 1 }, // Count the number of URLs for each day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date (oldest to newest)
      },
    ]);

    console.log("URLs created per day:", dailyCount);

    const monthlyCount = await Url.aggregate([
      {
        $project: {
          month: { $substr: ["$date", 0, 7] }, // Extract the year-month part of the date
        },
      },
      {
        $group: {
          _id: "$month", // Group by the extracted month
          count: { $sum: 1 }, // Count the number of URLs for each month
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month (oldest to newest)
      },
    ]);

    console.log("URLs created per month:", monthlyCount);

    return { dailyCount, monthlyCount };
  } catch (error) {
    console.error("Error getting URL counts:", error);
    throw error;
  }
};
