import dayjs from "dayjs";
import Liability from "../models/LiabilityModel.js";
import History from "../models/historyModel.js";

export const addLiabilityToDailySales = async (req, res) => {
  try {
    const { name, price, description ,quantity } = req.body || {};
    const userId = req.user._id;

    if (!name || !price || !description || !quantity) {
      return res.status(400).json({ message: "All product fields are required." });
    }

    const parsedQuantity = parseInt(quantity , 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message : "quantity must be a positive number." });
    }
    // Create a new product entry
    const newLiability = new Liability({
      name,
      price,
      description,
      quantity: parsedQuantity || 1, 
      user: userId,
      soldAt: dayjs().startOf('day').toDate(), // 👈 Store the date in proper format
      isPaid : false
    });

    await newLiability.save();

    if (!newLiability) {
      return res.status(500).json({ message: "Failed to create product." });
    }

    // Add it to the user's daily history
    await History.findOneAndUpdate(
      { user: userId, date: dayjs().startOf('day').toDate() },
      {
        $push: {
          Liability: {
            name: newLiability.name,
            description: newLiability.description,
            price: newLiability.price,
            quantity: newLiability.quantity || 1, 
            productId: newLiability._id,
            isPaid : false
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Liability added successfully  to daily liabilities.", product: newLiability });
  } catch (error) {
    console.error("Error adding Liability:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getAllLiabilities = async (req, res) => {
  try {

    const userId = req.user._id;

    const liabilities = await Liability.find({ user: userId });

    if (!liabilities || liabilities.length === 0) {
      return res.status(404).json({ message: "No liabilities found." });
    }
   
    res.status(200).json({ message: "All liabilities fetched successfully.", liabilities });
  } catch (error) {
    console.error("Error adding Liability:", error);
    res.status(500).json({ message: error.message });
  }
}

export const markLiabilityAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Liability.findByIdAndUpdate(
      id,
      { isPaid: true, paidAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Liability not found" });
    }

    res.status(200).json({
      message: "Liability marked as paid",
      liability: updated,
    });
  } catch (error) {
    console.error("Error in markLiabilityAsPaid:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getDailyLiability = async (req, res) => {
  try {
    const startOfDay = dayjs().startOf('day').toDate();
    const endOfDay = dayjs().endOf('day').toDate();

   const liabilities = await Liability.find({
      isPaid: false, // only unpaid liabilities remain
      soldAt: { // or createdAt depending on your model
        $gte: startOfDay,
        $lte: endOfDay,
      },
      user: req.user._id, // filter by user if you want
    });


    if (liabilities.length === 0) {
      return res.status(404).json({ message: "No liabilities were sold today" });
    }
    
    res.status(200).json({ message: "Today's liabilities fetched successfully", liabilities });
  } catch (error) {
    console.error("Error in getAllDailyliabilities : ", error);
    res.status(500).json({ message: error.message });
  }
}

export const deleteLiability = async (req, res) => {
  try {

    const {id} = req.params;

    const liability = await Liability.findByIdAndDelete(id);

    if (!liability) {
      return res.status(404).json({ message: "Liability not found." });
    }
    
    
    res.status(200).json({ message: "Liability deleted successfully.", liability }); 
  } catch (error) {
    console.error("Error in deletingLiabilities : ", error);
    res.status(500).json({ message: error.message });
  }
}




