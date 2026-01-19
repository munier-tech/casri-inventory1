import dayjs from "dayjs";
import History from "../models/historyModel.js";
import Liability from "../models/LiabilityModel.js";

export const getMyDailySales = async (req, res) => {
  try {
    const userId = req.user._id;
    const formattedDate = dayjs().startOf('day').toDate();

    const history = await History.findOne({
      user: userId,
      date: formattedDate,
    });

    if (!history || history.products.length === 0) {
      return res.status(404).json({ message: "No sales found for today" });
    }

    res.status(200).json({
      message: "Daily sales fetched successfully",
      date: formattedDate,
      products: history.products,
    });
  } catch (error) {
    console.error("Error in getMyDailySales:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserSaleHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const historyRecords = await History.find({ user: userId });

    if (!historyRecords || historyRecords.length === 0) {
      return res.status(404).json({ message: "No sales history found for this user" });
    }

    res.status(200).json({
      message: "User sales history fetched successfully",
      history: historyRecords,
    });
  } catch (error) {
    console.error("Error in getAllUserSaleHistory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSingleUserHistoryByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const formattedDate = dayjs(date).startOf('day').toDate();

    const historyRecord = await History.findOne({ user: userId, date: formattedDate });

    if (!historyRecord) {
      return res.status(404).json({ message: "No sales history found for this user on the specified date." });
    }

    res.status(200).json({
      message: "Sales history fetched successfully.",
      history: historyRecord,
      date: formattedDate,
    });
  } catch (error) {
    console.error("Error in getSingleUserHistoryByDate:", error.message);
    res.status(500).json({ message: error.message });
  }
};

 
 export const getProductsSoldByDate = async (req, res) => {
   try {
     const { date } = req.params;
 
     if (!date) {
       return res.status(400).json({ message: "Date parameter is required." });
     }
 
     const startOfDay = dayjs(date).startOf('day').toDate();
     const endOfDay = dayjs(date).endOf('day').toDate();
 
     // Find all history records for the day
     const historyRecords = await History.find({
       date: { $gte: startOfDay, $lte: endOfDay }
     });
 
     if (!historyRecords.length) {
       return res.status(404).json({ message: `No products sold on ${date}.` });
     }
 
     // Flatten and map all products from each history record
     const allProducts = historyRecords.flatMap(record =>
       record.products.map(product => ({
         name: product.name,
         description: product.description,
         price: product.price,
         quantity : product.quantity,
         user: record.user || "Unknown User",
         soldAt: record.date,
       }))

     );
 
     res.status(200).json({
       message: `Products sold on ${date} fetched successfully.`,
       data: allProducts,
     });
 
   } catch (error) {
     console.error("Error in getProductsSoldByDate:", error.message);
     res.status(500).json({ message: error.message });
   }
 };
 

 export const getLiabilityByDate = async (req , res) => {
  try {

    const { date  } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required." });
    }

    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();


    const historyRecords1 = await History.find({
      date : { $gte: startOfDay, $lte: endOfDay }
    })

    if (!historyRecords1 || historyRecords1.length === 0) {
      return res.status(404).json({ message: `No liabilities found on ${date}.` });
    }
    

   
    

   const allLiabilities = historyRecords1.flatMap(record =>
    record.Liability.map(liability => ({
    name : liability.name,
    description: liability.description,
    price: liability.price,
    quantity: liability.quantity || 1,
    user: record.user || "Unknown User",
    soldAt: record.date,
  }))
);

    res.status(200).json({ message : "Liabilities fetched successfully.", data: allLiabilities  });
    
  } catch (error) {
    console.error("Error in getLiabilityByDate:", error.message);
    res.status(500).json({ message: error.message });
  }
 }




export const getAllUsersHistory = async (req, res) => {
  try {



    const historyRecord = await History.find().sort({ date: -1 });
    

    if (!historyRecord || historyRecord.length === 0) {
      return res.status(404).json({ message: "No sales history found for all users." });
    }


    res.status(200).json({
      message: "Sales history fetched successfully.",
      history: historyRecord,
    });
  } catch (error) {
    console.error("Error in getAllUserHistory:", error.message);
    res.status(500).json({ message: error.message });
  }
}



export const deleteUserHistory = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const formattedDate = dayjs(date).startOf('day').toDate();

    const deletedHistory = await History.findOneAndDelete({
      user: userId,
      date: formattedDate
    });

    if (!deletedHistory) {
      return res.status(404).json({ message: "History not found for this user on the specified date." });
    }

    res.status(200).json({ message: "User history deleted successfully", deletedHistory });
  } catch (error) {
    console.error("Error in deletingUserHistory:", error.message);
    res.status(500).json({ message: error.message });
  }
};



export const deleteAllHistory = async (req, res) => {

  try {
    const deletedHistory = await History.deleteMany({});


  if (!deletedHistory) {
    return res.status(404).json({ message: "No history found to delete." });
  }


    res.status(200).json({ message: "All history deleted successfully", deletedHistory });
    
  } catch (error) {
    console.error("Error in deleting all history:", error.message);
    res.status(500).json({ message: error.message });
  }
}
