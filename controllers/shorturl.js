import { Url } from "../models/shorturl.js";

export function getUserUrls(req){
    return Url.find({user:req.user._id}).populate("user","username email")
}



// export const getUrlsCount = async () => {
//   try {
//     const dailyCount = await Url.aggregate([
//       {
//         $group: {
//           _id: "$date", // Group by the 'date' field
//           count: { $sum: 1 }, // Count the number of URLs for each day
//         },
//       },
//       {
//         $sort: { _id: 1 }, // Sort by date (oldest to newest)
//       },
//     ]);

//     console.log("URLs created per day:", dailyCount);

//     const monthlyCount = await Url.aggregate([
//       {
//         $project: {
//           month: { $substr: ["$date", 0, 7] }, // Extract the year-month part of the date
//         },
//       },
//       {
//         $group: {
//           _id: "$month", // Group by the extracted month
//           count: { $sum: 1 }, // Count the number of URLs for each month
//         },
//       },
//       {
//         $sort: { _id: 1 }, // Sort by month (oldest to newest)
//       },
//     ]);

//     console.log("URLs created per month:", monthlyCount);

//     return { dailyCount, monthlyCount };
//   } catch (error) {
//     console.error("Error getting URL counts:", error);
//     throw error;
//   }
// };


export const getUrlsCount = async () => {
  try {
    // Calculate daily counts and their average
    const dailyCount = await Url.aggregate([
      {
        $group: {
          _id: "$date", // Group by the 'date' field
          count: { $sum: 1 }, // Count the number of URLs for each day
        },
      },
    ]);

    // Calculate the average of daily counts
    const dailyAverage = await Url.aggregate([
      {
        $group: {
          _id: "$date", // Group by the 'date' field
          count: { $sum: 1 }, // Count the number of URLs for each day
        },
      },
      {
        $group: {
          _id: null, // No grouping key; calculate for all records
          average: { $avg: "$count" }, // Calculate the average count
        },
      },
    ]);

    console.log("URLs created per day:", dailyCount);
    console.log("Average URLs per day:", dailyAverage[0]?.average || 0);

    // Calculate monthly counts and their average
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
    ]);

    // Calculate the average of monthly counts
    const monthlyAverage = await Url.aggregate([
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
        $group: {
          _id: null, // No grouping key; calculate for all records
          average: { $avg: "$count" }, // Calculate the average count
        },
      },
    ]);

    console.log("URLs created per month:", monthlyCount);
    console.log("Average URLs per month:", monthlyAverage[0]?.average || 0);

    return {
      dailyCount,
      dailyAverage: dailyAverage[0]?.average || 0,
      monthlyCount,
      monthlyAverage: monthlyAverage[0]?.average || 0,
    };
  } catch (error) {
    console.error("Error getting URL counts:", error);
    throw error;
  }
};
