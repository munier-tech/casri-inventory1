import Product from "../models/productModel.js";
import Sale from "../models/salesModel.js";
import dayjs from "dayjs";

// ========== HELPER FUNCTIONS ==========

// Validate payment method
const validatePaymentMethod = (paymentMethod) => {
  const validPaymentMethods = ['cash', 'zaad', 'edahab'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new Error(`Invalid payment method '${paymentMethod}'. Valid options: ${validPaymentMethods.join(', ')}`);
  }
  return true;
};

// Calculate totals
const calculateSaleTotals = (products, discountPercentage = 0, discountAmount = 0) => {
  const subtotal = products.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const discountTotal = discountPercentage > 0 
    ? (discountPercentage / 100) * subtotal 
    : discountAmount;
  const grandTotal = subtotal - discountTotal;
  
  return { subtotal, discountTotal, grandTotal };
};

// Generate unique sale number
const generateSaleNumber = () => {
  return `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// ========== MAIN SALE FUNCTIONS ==========

// ✅ Create Multiple Products Sale (New System)
export const createMultipleProductsSale = async (req, res) => {
  try {
    const { 
      products, 
      discountPercentage = 0, 
      discountAmount = 0, 
      paymentMethod = 'cash', 
      amountPaid, 
      saleDate,
      customerName,
      customerPhone,
      notes
    } = req.body;

    // Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "At least one product is required" 
      });
    }

    // Validate payment method
    try {
      validatePaymentMethod(paymentMethod);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const validatedProducts = [];
    const stockUpdates = [];
    let totalQuantity = 0;

    // Validate each product
    for (const item of products) {
      const { productId, quantity, sellingPrice, discount = 0 } = item;

      if (!productId || !quantity || !sellingPrice) {
        return res.status(400).json({
          success: false,
          error: "Each product must have productId, quantity, and sellingPrice"
        });
      }

      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found for ID: ${productId}`
        });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
        });
      }

      // Calculate item totals
      const itemTotal = sellingPrice * quantity;
      const itemDiscount = (discount / 100) * itemTotal;
      const itemNet = itemTotal - itemDiscount;

      validatedProducts.push({
        product: productId,
        name: product.name,
        cost: product.cost,
        quantity,
        sellingPrice,
        discount,
        itemTotal,
        itemDiscount,
        itemNet
      });

      stockUpdates.push({
        productId: productId,
        quantity: quantity,
        currentStock: product.stock
      });

      totalQuantity += quantity;
    }

    // Calculate totals
    const { subtotal, discountTotal, grandTotal } = calculateSaleTotals(
      validatedProducts, 
      discountPercentage, 
      discountAmount
    );

    // Validate payment amount
    const changeAmount = amountPaid - grandTotal;
    
    if (amountPaid < grandTotal) {
      return res.status(400).json({
        success: false,
        error: `Insufficient payment. Required: $${grandTotal.toFixed(2)}, Paid: $${amountPaid?.toFixed(2) || '0.00'}`
      });
    }

    // Update product stocks
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.quantity } },
        { new: true }
      );
    }

    // Create sale record
    const saleData = {
      products: validatedProducts.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        discount: item.discount,
        itemTotal: item.itemTotal,
        itemDiscount: item.itemDiscount,
        itemNet: item.itemNet
      })),
      subtotal,
      discountPercentage,
      discountAmount: discountTotal,
      grandTotal,
      paymentMethod,
      amountPaid,
      changeAmount,
      totalQuantity,
      user: req.user?._id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      notes: notes || null,
      status: 'completed',
      saleNumber: generateSaleNumber(),
      ...(saleDate && { createdAt: dayjs(saleDate).toDate() })
    };

    const sale = await Sale.create(saleData);

    res.status(201).json({
      success: true,
      message: "Sale completed successfully",
      data: {
        sale,
        receipt: {
          saleNumber: sale.saleNumber,
          date: sale.createdAt,
          items: sale.products.length,
          subtotal: sale.subtotal,
          discount: sale.discountAmount,
          total: sale.grandTotal,
          payment: sale.paymentMethod,
          amountPaid: sale.amountPaid,
          change: sale.changeAmount
        }
      }
    });

  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error while processing sale",
      details: error.message 
    });
  }
};

// ✅ Create Sale By Date
export const createSaleByDate = async (req, res) => {
  try {
    const { 
      products, 
      discountPercentage = 0, 
      discountAmount = 0, 
      paymentMethod = 'cash', 
      amountPaid, 
      saleDate,
      customerName,
      customerPhone,
      notes
    } = req.body;

    // Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "At least one product is required" 
      });
    }

    // Validate sale date
    const saleDateTime = dayjs(saleDate);
    if (!saleDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        error: "Invalid sale date format. Use YYYY-MM-DD"
      });
    }

    // Check if sale date is in the future (allow past dates but not future)
    const now = dayjs();
    if (saleDateTime.isAfter(now, 'day')) {
      return res.status(400).json({
        success: false,
        error: "Sale date cannot be in the future"
      });
    }

    // Validate payment method
    try {
      validatePaymentMethod(paymentMethod);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const validatedProducts = [];
    const stockUpdates = [];
    let totalQuantity = 0;

    // Validate each product
    for (const item of products) {
      const { productId, quantity, sellingPrice, discount = 0 } = item;

      if (!productId || !quantity || !sellingPrice) {
        return res.status(400).json({
          success: false,
          error: "Each product must have productId, quantity, and sellingPrice"
        });
      }

      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found for ID: ${productId}`
        });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
        });
      }

      // Calculate item totals
      const itemTotal = sellingPrice * quantity;
      const itemDiscount = (discount / 100) * itemTotal;
      const itemNet = itemTotal - itemDiscount;

      validatedProducts.push({
        product: productId,
        name: product.name,
        cost: product.cost,
        quantity,
        sellingPrice,
        discount,
        itemTotal,
        itemDiscount,
        itemNet
      });

      stockUpdates.push({
        productId: productId,
        quantity: quantity,
        currentStock: product.stock
      });

      totalQuantity += quantity;
    }

    // Calculate totals
    const { subtotal, discountTotal, grandTotal } = calculateSaleTotals(
      validatedProducts, 
      discountPercentage, 
      discountAmount
    );

    // Validate payment amount
    const changeAmount = amountPaid - grandTotal;
    
    if (amountPaid < grandTotal) {
      return res.status(400).json({
        success: false,
        error: `Insufficient payment. Required: $${grandTotal.toFixed(2)}, Paid: $${amountPaid?.toFixed(2) || '0.00'}`
      });
    }

    // Update product stocks
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.quantity } },
        { new: true }
      );
    }

    // Create sale record with specific date
    const saleData = {
      products: validatedProducts.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        discount: item.discount,
        itemTotal: item.itemTotal,
        itemDiscount: item.itemDiscount,
        itemNet: item.itemNet
      })),
      subtotal,
      discountPercentage,
      discountAmount: discountTotal,
      grandTotal,
      paymentMethod,
      amountPaid,
      changeAmount,
      totalQuantity,
      user: req.user?._id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      notes: notes || null,
      status: 'completed',
      saleNumber: generateSaleNumber(),
      createdAt: saleDateTime.toDate()
    };

    const sale = await Sale.create(saleData);

    res.status(201).json({
      success: true,
      message: `Sale for ${saleDateTime.format('MMM D, YYYY')} completed successfully`,
      data: {
        sale,
        receipt: {
          saleNumber: sale.saleNumber,
          date: sale.createdAt,
          items: sale.products.length,
          subtotal: sale.subtotal,
          discount: sale.discountAmount,
          total: sale.grandTotal,
          payment: sale.paymentMethod,
          amountPaid: sale.amountPaid,
          change: sale.changeAmount
        }
      }
    });

  } catch (error) {
    console.error("Error creating sale by date:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error while processing sale",
      details: error.message 
    });
  }
};

// ✅ Quick Product Search for Sales
export const searchProductsForSale = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    if (search && search.trim() !== '') {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query)
      .select('name cost price stock lowStockThreshold expiryDate description')
      .sort({ name: 1 })
      .limit(20);

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      cost: product.cost,
      price: product.price || product.cost,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      expiryDate: product.expiryDate,
      inStock: product.stock > 0,
      stockStatus: product.stock === 0 ? 'out' : 
                   product.stock <= (product.lowStockThreshold || 5) ? 'low' : 'high'
    }));

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Error searching products",
      details: error.message 
    });
  }
};

// ✅ Get All Sales (for new system)
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, paymentMethod } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: dayjs(startDate).startOf('day').toDate(),
        $lte: dayjs(endDate).endOf('day').toDate()
      };
    }

    // Filter by payment method if provided
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(query)
      .populate("user", "username role")
      .populate("products.product", "name cost")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSales = await Sale.countDocuments(query);
    const totalRevenue = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    // Get payment method statistics
    const paymentStats = await Sale.aggregate([
      { $match: query },
      { $group: { 
        _id: "$paymentMethod", 
        count: { $sum: 1 },
        totalRevenue: { $sum: "$grandTotal" },
        avgSale: { $avg: "$grandTotal" }
      }},
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSales / limit),
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      stats: {
        paymentMethods: paymentStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ Get Sale by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("user", "username role")
      .populate("products.product", "name cost price stock");

    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        error: "Sale not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ Get Today's Sales Summary
export const getDailySalesSummary = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).populate("user", "username");

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.grandTotal, 0),
      totalItems: sales.reduce((sum, sale) => sum + sale.totalQuantity, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      averageSale: sales.length > 0 ? 
        sales.reduce((sum, sale) => sum + sale.grandTotal, 0) / sales.length : 0,
      salesByPaymentMethod: sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'cash';
        if (!acc[method]) {
          acc[method] = { count: 0, revenue: 0 };
        }
        acc[method].count += 1;
        acc[method].revenue += sale.grandTotal;
        return acc;
      }, {}),
      recentSales: sales.slice(0, 10)
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ Update Sale
export const updateSale = async (req, res) => {
  try {
    const { discountPercentage, discountAmount, paymentMethod, amountPaid, notes, status } = req.body;
    
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        error: "Sale not found" 
      });
    }

    // Validate payment method if provided
    if (paymentMethod) {
      try {
        validatePaymentMethod(paymentMethod);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }

    // If sale is completed, don't allow updates to certain fields
    if (sale.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: "Completed sales cannot be modified. Create a refund instead."
      });
    }

    // Update sale fields
    if (discountPercentage !== undefined) sale.discountPercentage = discountPercentage;
    if (discountAmount !== undefined) sale.discountAmount = discountAmount;
    if (paymentMethod) sale.paymentMethod = paymentMethod;
    if (amountPaid !== undefined) {
      sale.amountPaid = amountPaid;
      sale.changeAmount = amountPaid - sale.grandTotal;
    }
    if (notes !== undefined) sale.notes = notes;
    if (status) sale.status = status;

    // Recalculate totals if discount changed
    if (discountPercentage !== undefined || discountAmount !== undefined) {
      const { subtotal, discountTotal, grandTotal } = calculateSaleTotals(
        sale.products,
        sale.discountPercentage,
        sale.discountAmount
      );
      sale.subtotal = subtotal;
      sale.discountAmount = discountTotal;
      sale.grandTotal = grandTotal;
      if (sale.amountPaid) {
        sale.changeAmount = sale.amountPaid - sale.grandTotal;
      }
    }

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: sale
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ Delete Sale (with stock restoration)
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        error: "Sale not found" 
      });
    }

    // Restore product stocks
    for (const item of sale.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    await sale.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sale deleted and stock restored successfully",
      deletedSaleId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✅ Get Sales by Date Range
export const getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    })
      .populate("user", "username role")
      .populate("products.product", "name cost")
      .sort({ createdAt: -1 });

    const summary = {
      sales,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.grandTotal, 0),
      totalItems: sales.reduce((sum, sale) => sum + sale.totalQuantity, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      salesByPaymentMethod: sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'cash';
        if (!acc[method]) {
          acc[method] = { count: 0, revenue: 0 };
        }
        acc[method].count += 1;
        acc[method].revenue += sale.grandTotal;
        return acc;
      }, {}),
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ========== DAILY SALES FUNCTIONS ==========

// ✅ Get Today's Sales (from old system)
export const getDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({ 
      createdAt: { $gte: start, $lte: end } 
    })
      .populate("products.product", "name cost")
      .populate("user", "username role")
      .sort({ createdAt: -1 });

    const total = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.totalQuantity, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    
    res.status(200).json({ 
      success: true,
      sales, 
      total,
      totalQuantity,
      salesByPaymentMethod,
      count: sales.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get logged-in user's sales for today
export const getMyDailySales = async (req, res) => {
  try {
    const userId = req.user._id;
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate("products.product", "name cost")
      .sort({ createdAt: -1 });

    if (!sales.length) return res.status(404).json({ 
      success: false,
      message: "No sales found for today" 
    });

    const total = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count += 1;
      acc[method].revenue += sale.grandTotal;
      return acc;
    }, {});
    
    res.status(200).json({ 
      success: true,
      message: "Today's sales fetched", 
      sales, 
      total,
      salesByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Get all users' sales for today
export const getUsersDailySales = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("user", "username role")
      .populate("products.product", "name cost");

    if (!sales.length) {
      return res.status(404).json({ 
        success: false,
        message: "No sales found for users today" 
      });
    }

    const grouped = sales.reduce((acc, sale) => {
      const userId = sale.user?._id || "unknown";

      if (!acc[userId]) {
        acc[userId] = {
          username: sale.user?.username || "Unknown",
          role: sale.user?.role || "N/A",
          sales: [],
          total: 0,
          paymentMethods: {}
        };
      }

      acc[userId].sales.push(sale);
      acc[userId].total += sale.grandTotal;
      
      // Track payment methods per user
      const method = sale.paymentMethod || 'cash';
      if (!acc[userId].paymentMethods[method]) {
        acc[userId].paymentMethods[method] = { count: 0, revenue: 0 };
      }
      acc[userId].paymentMethods[method].count += 1;
      acc[userId].paymentMethods[method].revenue += sale.grandTotal;

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Daily sales fetched",
      data: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Get sales by specific date
export const getSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("products.product", "name cost")
      .sort({ createdAt: -1 });

    if (!sales.length) return res.status(404).json({ 
      success: false,
      message: `No sales found on ${date}` 
    });

    const total = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'cash';
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count += 1;
      acc[method].revenue += sale.grandTotal;
      return acc;
    }, {});
    
    res.status(200).json({ 
      success: true,
      message: `Sales for ${date} fetched`, 
      sales, 
      total,
      salesByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Get all users' sales by date
export const getAllUsersSalesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = dayjs(date).startOf('day').toDate();
    const end = dayjs(date).endOf('day').toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("user", "username role")
      .populate("products.product", "name cost");

    if (!sales.length) {
      return res.status(404).json({ 
        success: false,
        message: `No sales found on ${date}` 
      });
    }

    const grouped = sales.reduce((acc, sale) => {
      const userId = sale.user?._id.toString() || "unknown";

      if (!acc[userId]) {
        acc[userId] = {
          username: sale.user?.username || "Unknown",
          role: sale.user?.role || "N/A",
          sales: [],
          total: 0,
        };
      }

      acc[userId].sales.push(sale);
      acc[userId].total += sale.grandTotal;

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: `Sales for ${dayjs(date).format("MM-DD-YYYY")} fetched`,
      data: Object.values(grouped),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};