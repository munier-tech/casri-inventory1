// controllers/purchaseController.js
import dayjs from "dayjs";
import Purchase from "../models/purchaseModel.js";

/**
 * Create a new purchase record
 */
export const addPurchase = async (req, res) => {
  try {
    const { productName, supplierName, price, quantity } = req.body || {};
    const userId = req.user._id;

    if (!productName || !supplierName || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parsedQuantity = parseInt(quantity, 10);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number." });
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number." });
    }

    const newPurchase = new Purchase({
      productName,
      supplierName,
      price: parsedPrice,
      quantity: parsedQuantity,
      user: userId,
      datePurchased: dayjs().toDate(),
    });

    await newPurchase.save();

    res.status(201).json({
      message: "Purchase recorded successfully.",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error("Error adding Purchase:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch all purchases for current user
 */
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id }).populate("user", "username");

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases found." });
    }

    res.status(200).json({ message: "All purchases fetched successfully.", purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get today's purchases for current user
 */
export const getDailyPurchases = async (req, res) => {
  try {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const purchases = await Purchase.find({
      datePurchased: { $gte: startOfDay, $lte: endOfDay },
      user: req.user._id,
    });

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchases recorded today." });
    }

    res.status(200).json({ message: "Today's purchases fetched successfully", purchases });
  } catch (error) {
    console.error("Error in getDailyPurchases:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update a purchase record
 */
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, supplierName, price, quantity, datePurchased } = req.body || {};

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    // Authorization: only the user who recorded the purchase may update it
    if (purchase.user && purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this purchase." });
    }

    // Validate and set fields if provided
    if (productName !== undefined) purchase.productName = productName;
    if (supplierName !== undefined) purchase.supplierName = supplierName;

    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "Price must be a non-negative number." });
      }
      purchase.price = parsedPrice;
    }

    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number." });
      }
      purchase.quantity = parsedQuantity;
    }

    if (datePurchased !== undefined) {
      const parsedDate = dayjs(datePurchased);
      if (!parsedDate.isValid()) {
        return res.status(400).json({ message: "Invalid datePurchased value." });
      }
      purchase.datePurchased = parsedDate.toDate();
    }

    purchase.updatedAt = new Date();

    const updated = await purchase.save();

    res.status(200).json({
      message: "Purchase updated successfully.",
      purchase: updated,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a purchase record
 */
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByIdAndDelete(id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    res.status(200).json({ message: "Purchase deleted successfully.", purchase });
  } catch (error) {
    console.error("Error in deletePurchase:", error);
    res.status(500).json({ message: error.message });
  }
};
