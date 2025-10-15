// controllers/purchaseController.js
import dayjs from "dayjs";
import Purchase from "../models/purchaseModel.js";

export const addPurchase = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};

    // Allow both single and multiple purchase entries
    const purchases = Array.isArray(body.purchases) ? body.purchases : [body];

    if (!purchases.length) {
      return res.status(400).json({
        message: "Fadlan soo dir hal ama dhowr iibsasho si loo abuuro.",
      });
    }

    const createdPurchases = [];
    const failedPurchases = [];

    for (const item of purchases) {
      const {
        productName,
        supplierName,
        price,
        quantity,
        additionalPrice,
        substractingPrice,
        description,
        total,
      } = item || {};

      // Validate required fields
      if (!productName || !supplierName || price === undefined || quantity === undefined) {
        failedPurchases.push({
          ...item,
          reason: "Magaca alaabta, qiimaha, tirada, iyo magaca alaab-qeybiyaha waa lama huraan.",
        });
        continue;
      }

      // Parse and validate numeric fields
      const parsedQuantity = parseInt(quantity, 10);
      const parsedPrice = parseFloat(price);
      const parsedAdditionalPrice = additionalPrice ? parseFloat(additionalPrice) : 0;
      const parsedSubstractingPrice = substractingPrice ? parseFloat(substractingPrice) : 0;

      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        failedPurchases.push({ ...item, reason: "Quantity waa inuu noqdaa tiro togan." });
        continue;
      }
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        failedPurchases.push({ ...item, reason: "Price waa inuu noqdaa tiro aan tabaneyn." });
        continue;
      }
      if (isNaN(parsedAdditionalPrice) || parsedAdditionalPrice < 0) {
        failedPurchases.push({ ...item, reason: "Additional price waa inuu noqdaa tiro aan tabaneyn." });
        continue;
      }
      if (isNaN(parsedSubstractingPrice) || parsedSubstractingPrice < 0) {
        failedPurchases.push({ ...item, reason: "Substracting price waa inuu noqdaa tiro aan tabaneyn." });
        continue;
      }

      // Calculate total (if not provided)
      const parsedTotal = total
        ? parseFloat(total)
        : parsedQuantity * parsedPrice + parsedAdditionalPrice - parsedSubstractingPrice;

      const purchase = {
        productName,
        supplierName,
        price: parsedPrice,
        quantity: parsedQuantity,
        additionalPrice: parsedAdditionalPrice,
        substractingPrice: parsedSubstractingPrice,
        description: description || "",
        total: parsedTotal,
        user: userId,
        datePurchased: dayjs().toDate(),
      };

      createdPurchases.push(purchase);
    }

    if (createdPurchases.length === 0) {
      return res.status(400).json({
        message: "Ma jiro wax iibsasho sax ah oo la abuuri karo.",
        failedPurchases,
      });
    }

    // Insert all valid purchases at once
    const savedPurchases = await Purchase.insertMany(createdPurchases);

    res.status(201).json({
      message:
        savedPurchases.length > 1
          ? "Iibsashooyin badan si guul leh ayaa loo diiwaangeliyay."
          : "Iibsashada si guul leh ayaa loo diiwaangeliyay.",
      createdCount: savedPurchases.length,
      failedCount: failedPurchases.length,
      createdPurchases: savedPurchases,
      failedPurchases,
    });
  } catch (error) {
    console.error("Error adding purchases:", error);
    res.status(500).json({ message: error.message });
  }
};



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
/**
 * Update a purchase record
 */
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, supplierName, price, quantity, additionalPrice, substractingPrice, description, total, datePurchased } = req.body || {};

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    // Authorization: only the user who recorded the purchase may update it
    if (purchase.user && purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this purchase." });
    }

    // Store original values for calculation
    const originalQuantity = purchase.quantity;
    const originalPrice = purchase.price;
    const originalAdditionalPrice = purchase.additionalPrice;
    const originalSubtractingPrice = purchase.substractingPrice;

    // Validate and set fields if provided
    if (productName !== undefined) purchase.productName = productName;
    if (supplierName !== undefined) purchase.supplierName = supplierName;
    if (description !== undefined) purchase.description = description;

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

    if (additionalPrice !== undefined) {
      const parsedAdditionalPrice = parseFloat(additionalPrice);
      if (isNaN(parsedAdditionalPrice) || parsedAdditionalPrice < 0) {
        return res.status(400).json({ message: "Additional price must be a non-negative number." });
      }
      purchase.additionalPrice = parsedAdditionalPrice;
    }

    if (substractingPrice !== undefined) {
      const parsedSubstractingPrice = parseFloat(substractingPrice);
      if (isNaN(parsedSubstractingPrice) || parsedSubstractingPrice < 0) {
        return res.status(400).json({ message: "Substracting price must be a non-negative number." });
      }
      purchase.substractingPrice = parsedSubstractingPrice;
    }

    // Calculate total using UPDATED values, not original ones
    if (total !== undefined) {
      const parsedTotal = parseFloat(total);
      if (isNaN(parsedTotal) || parsedTotal < 0) {
        return res.status(400).json({ message: "Total must be a non-negative number." });
      }
      purchase.total = parsedTotal;
    } else {
      // Use the UPDATED values for calculation, not the original ones
      const currentQuantity = quantity !== undefined ? parseInt(quantity, 10) : purchase.quantity;
      const currentPrice = price !== undefined ? parseFloat(price) : purchase.price;
      const currentAdditionalPrice = additionalPrice !== undefined ? parseFloat(additionalPrice) : purchase.additionalPrice;
      const currentSubtractingPrice = substractingPrice !== undefined ? parseFloat(substractingPrice) : purchase.substractingPrice;

      const calculatedTotal = 
        (currentQuantity * currentPrice) + 
        (currentAdditionalPrice || 0) - 
        (currentSubtractingPrice || 0);
      
      purchase.total = calculatedTotal;
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
