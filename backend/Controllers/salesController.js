import Product from "../models/productModel.js";
import Sale from "../models/salesModel.js";
import User from "../models/userModel.js";
import dayjs from "dayjs";

// ✅ Create Sale
export const createSale = async (req, res) => {
  try {
    const { productId, quantity, sellingCost } = req.body;

    // Validate input
    if (!productId || !quantity || !sellingCost) {
      return res.status(400).json({ error: "Product, quantity, and selling cost are required" });
    }

    // Update product stock
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }
    
    product.stock -= quantity;
    await product.save();
    
    // Create sale record
    const sale = new Sale({
      product: productId,
      quantity,
      sellingCost,
      totalAmount: quantity * sellingCost,
      user: req.user._id // Add the user who made the sale
    });

    await sale.save();
    
    // Populate product details in the response
    await sale.populate("product", "name cost");
    
    res.status(201).json({
      message: "Sale created successfully",
      sale,
      remainingStock: product.stock
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product", "name cost")
      .populate("user", "username role")
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Sale by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("product", "name cost")
      .populate("user", "username");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================== DAILY / DATE FUNCTIONS ==================

// Get Today's Sales (FIXED - No ObjectId required)
export const getDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({ 
      createdAt: { $gte: start, $lte: end } 
    })
      .populate("product", "name cost")
      .sort({ createdAt: -1 });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    res.status(200).json({ 
      sales, 
      total,
      totalQuantity,
      count: sales.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logged-in user's sales for today
export const getMyDailySales = async (req, res) => {
  try {
    const userId = req.user._id;
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("product", "name cost")
      .sort({ createdAt: -1 });

    if (!sales.length) return res.status(404).json({ message: "Maanta wax iib ah Ma dhicin" });

    const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    res.status(200).json({ 
      message: "Today's sales fetched", 
      sales, 
      total 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users' sales for today
export const getUsersDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    // Find sales for today and populate user + product
    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("user", "username role") // 👈 this must match your Sale schema
      .populate("product", "name cost");

    if (!sales.length) {
      return res
        .status(404)
        .json({ message: "wax iib ah looma helin Shaqaalaha Maanta" });
    }

    // Group sales by user
    const grouped = sales.reduce((acc, sale) => {
      const userId = sale.user?._id || "unknown";

      if (!acc[userId]) {
        acc[userId] = {
          username: sale.user?.username || "Unknown",
          role: sale.user?.role || "N/A",
          sales: [],
          total: 0,
        };
      }

      acc[userId].sales.push(sale);
      acc[userId].total += sale.totalAmount;

      return acc;
    }, {});

    res.status(200).json({
      message: "Daily sales fetched",
      data: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get sales by date
export const getSalesByDate = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("product", "name cost")
      .sort({ createdAt: -1 });

    if (!sales.length) return res.status(404).json({ message: `Wax iib ah ma dhicin maanta${date}` });

    const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    res.status(200).json({ 
      message: `Sales for ${date} fetched`, 
      sales, 
      total 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users' sales by date
export const getAllUsersSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const users = await User.find({ role: { $in: ["employee", "admin"] } });

    const results = await Promise.all(
      users.map(async (user) => {
        const sales = await Sale.find({
          user: user._id,
          createdAt: { $gte: start, $lte: end },
        }).populate("product", "name cost");

        return {
          username: user.username,
          role: user.role,
          sales,
          total: sales.reduce((sum, s) => sum + s.totalAmount, 0),
        };
      })
    );

    const filteredResults = results.filter(r => r.sales.length > 0);
    if (!filteredResults.length) return res.status(404).json({ message: `No sales found on ${date} for any user` });

    res.status(200).json({ message: `Sales for ${date} fetched`, data: filteredResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Sale
export const updateSale = async (req, res) => {
  try {
    const { productId, quantity, sellingCost } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // If product changed, handle stock adjustments
    if (productId && productId !== sale.product.toString()) {
      const oldProduct = await Product.findById(sale.product);
      const newProduct = await Product.findById(productId);
      
      if (!oldProduct || !newProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Return stock to old product
      oldProduct.stock += sale.quantity;
      await oldProduct.save();

      // Check if new product has enough stock
      if (quantity > newProduct.stock) {
        return res.status(400).json({ error: "Not enough stock for updated quantity" });
      }

      // Deduct from new product
      newProduct.stock -= quantity;
      await newProduct.save();

      sale.product = productId;
    } else if (quantity !== sale.quantity) {
      // Only quantity changed, adjust stock
      const product = await Product.findById(sale.product);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const quantityDiff = quantity - sale.quantity;
      if (quantityDiff > product.stock) {
        return res.status(400).json({ error: "Alaab kuuma Taalo Kaydka" });
      }

      product.stock -= quantityDiff;
      await product.save();
    }

    // Update sale
    sale.quantity = quantity;
    sale.sellingCost = sellingCost;
    sale.totalAmount = quantity * sellingCost;
    await sale.save();

    await sale.populate("product", "name cost");

    res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Sale
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    const product = await Product.findById(sale.product);
    if (product) {
      // Return stock to inventory
      product.stock += sale.quantity;
      await product.save();
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};