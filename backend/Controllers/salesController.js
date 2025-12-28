import Product from "../models/productModel.js";
import Sale from "../models/salesModel.js";
import dayjs from "dayjs";

// ========== HELPER FUNCTIONS ==========
const validatePaymentMethod = (paymentMethod) => {
  const validPaymentMethods = ['cash', 'zaad', 'edahab', 'credit'];
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

// ✅ Create Multiple Products Sale (New System with amountDue and amountPaid)
export const createMultipleProductsSale = async (req, res) => {
  try {
    const { 
      products, 
      discountPercentage = 0, 
      discountAmount = 0, 
      paymentMethod = 'cash', 
      amountDue, // Total amount customer owes
      amountPaid, // Amount customer actually paid
      saleDate,
      customerName,
      customerPhone,
      notes,
      dueDate // Optional due date for credit sales
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

    // Validate amounts
    if (!amountDue || amountDue <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount due is required and must be greater than 0"
      });
    }

    if (!amountPaid || amountPaid < 0) {
      return res.status(400).json({
        success: false,
        error: "Amount paid is required and cannot be negative"
      });
    }

    if (amountPaid > amountDue) {
      return res.status(400).json({
        success: false,
        error: "Amount paid cannot exceed amount due"
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

    // Validate grand total matches amount due
    if (Math.abs(grandTotal - amountDue) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Amount due ($${amountDue}) does not match calculated grand total ($${grandTotal})`
      });
    }

    // Calculate change and remaining balance
    const changeAmount = amountPaid > amountDue ? amountPaid - amountDue : 0;
    const remainingBalance = Math.max(0, amountDue - amountPaid);

    // Determine sale status
    let status = 'pending';
    if (amountPaid >= amountDue) {
      status = 'completed';
    } else if (amountPaid > 0) {
      status = 'partially_paid';
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
      amountDue,
      amountPaid,
      remainingBalance,
      changeAmount,
      paymentMethod,
      totalQuantity,
      user: req.user?._id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      notes: notes || null,
      status,
      saleNumber: generateSaleNumber(),
      dueDate: dueDate ? new Date(dueDate) : null,
      ...(saleDate && { createdAt: dayjs(saleDate).toDate() }),
      // Create initial payment history entry
      paymentHistory: [{
        date: new Date(),
        amount: amountPaid,
        paymentMethod: paymentMethod,
        collectedBy: req.user?._id,
        notes: amountPaid >= amountDue ? 'Full payment' : 'Partial payment'
      }]
    };

    const sale = await Sale.create(saleData);

    res.status(201).json({
      success: true,
      message: amountPaid >= amountDue ? "Sale completed successfully" : "Sale recorded with partial payment",
      data: {
        sale,
        receipt: {
          saleNumber: sale.saleNumber,
          date: sale.createdAt,
          items: sale.products.length,
          subtotal: sale.subtotal,
          discount: sale.discountAmount,
          total: sale.amountDue,
          paid: sale.amountPaid,
          balance: sale.remainingBalance,
          change: sale.changeAmount,
          payment: sale.paymentMethod,
          status: sale.status
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
      amountDue,
      amountPaid,
      saleDate,
      customerName,
      customerPhone,
      notes,
      dueDate
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

    // Validate amounts
    if (!amountDue || amountDue <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount due is required and must be greater than 0"
      });
    }

    if (!amountPaid || amountPaid < 0) {
      return res.status(400).json({
        success: false,
        error: "Amount paid is required and cannot be negative"
      });
    }

    if (amountPaid > amountDue) {
      return res.status(400).json({
        success: false,
        error: "Amount paid cannot exceed amount due"
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

    // Validate grand total matches amount due
    if (Math.abs(grandTotal - amountDue) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Amount due ($${amountDue}) does not match calculated grand total ($${grandTotal})`
      });
    }

    // Calculate change and remaining balance
    const changeAmount = amountPaid > amountDue ? amountPaid - amountDue : 0;
    const remainingBalance = Math.max(0, amountDue - amountPaid);

    // Determine sale status
    let status = 'pending';
    if (amountPaid >= amountDue) {
      status = 'completed';
    } else if (amountPaid > 0) {
      status = 'partially_paid';
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
      amountDue,
      amountPaid,
      remainingBalance,
      changeAmount,
      paymentMethod,
      totalQuantity,
      user: req.user?._id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      notes: notes || null,
      status,
      saleNumber: generateSaleNumber(),
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: saleDateTime.toDate(),
      // Create initial payment history entry
      paymentHistory: [{
        date: new Date(),
        amount: amountPaid,
        paymentMethod: paymentMethod,
        collectedBy: req.user?._id,
        notes: amountPaid >= amountDue ? 'Full payment' : 'Partial payment'
      }]
    };

    const sale = await Sale.create(saleData);

    res.status(201).json({
      success: true,
      message: `Sale for ${saleDateTime.format('MMM D, YYYY')} ${amountPaid >= amountDue ? 'completed' : 'recorded with partial payment'}`,
      data: {
        sale,
        receipt: {
          saleNumber: sale.saleNumber,
          date: sale.createdAt,
          items: sale.products.length,
          subtotal: sale.subtotal,
          discount: sale.discountAmount,
          total: sale.amountDue,
          paid: sale.amountPaid,
          balance: sale.remainingBalance,
          change: sale.changeAmount,
          payment: sale.paymentMethod,
          status: sale.status
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


// ✅ Quick Product Search for Sales (unchanged)
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

// ✅ Get All Sales (updated to include amountDue and amountPaid)
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, paymentMethod, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };

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

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const sales = await Sale.find(query)
      .populate("user", "username role")
      .populate("products.product", "name cost")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSales = await Sale.countDocuments(query);
    
    // Calculate totals
    const totals = await Sale.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: null, 
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalSalesValue: { $sum: "$grandTotal" }
        } 
      }
    ]);

    // Get payment method statistics
    const paymentStats = await Sale.aggregate([
      { $match: query },
      { $group: { 
        _id: "$paymentMethod", 
        count: { $sum: 1 },
        totalAmountDue: { $sum: "$amountDue" },
        totalAmountPaid: { $sum: "$amountPaid" },
        avgSale: { $avg: "$amountDue" }
      }},
      { $sort: { totalAmountDue: -1 } }
    ]);

    // Get status statistics
    const statusStats = await Sale.aggregate([
      { $match: query },
      { $group: { 
        _id: "$status", 
        count: { $sum: 1 },
        totalAmountDue: { $sum: "$amountDue" },
        totalAmountPaid: { $sum: "$amountPaid" },
        totalRemainingBalance: { $sum: "$remainingBalance" }
      }},
      { $sort: { totalRemainingBalance: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSales / limit),
        totalSales,
        totals: totals[0] || {
          totalAmountDue: 0,
          totalAmountPaid: 0,
          totalRemainingBalance: 0,
          totalSalesValue: 0
        }
      },
      stats: {
        paymentMethods: paymentStats,
        statuses: statusStats
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

// ✅ Update Sale
export const updateSale = async (req, res) => {
  try {
    const { 
      discountPercentage, 
      discountAmount, 
      paymentMethod, 
      amountDue, 
      amountPaid, 
      notes, 
      status,
      dueDate 
    } = req.body;
    
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

    // If sale is completed, be careful about updates
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
    if (amountDue !== undefined) sale.amountDue = amountDue;
    if (amountPaid !== undefined) sale.amountPaid = amountPaid;
    if (notes !== undefined) sale.notes = notes;
    if (status) sale.status = status;
    if (dueDate !== undefined) sale.dueDate = dueDate ? new Date(dueDate) : null;

    // Recalculate if amounts changed
    if (amountDue !== undefined || amountPaid !== undefined) {
      sale.remainingBalance = Math.max(0, sale.amountDue - sale.amountPaid);
      sale.changeAmount = sale.amountPaid > sale.amountDue ? sale.amountPaid - sale.amountDue : 0;
    }

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
      
      // Adjust amount due to match grand total
      if (sale.amountDue !== grandTotal) {
        sale.amountDue = grandTotal;
        sale.remainingBalance = Math.max(0, sale.amountDue - sale.amountPaid);
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

// ✅ Get Daily Sales Summary
export const getDailySalesSummary = async (req, res) => {
  try {
    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end },
      user: req.user._id
    }).populate("user", "username");

    const summary = {
      totalSales: sales.length,
      totalAmountDue: sales.reduce((sum, sale) => sum + sale.amountDue, 0),
      totalAmountPaid: sales.reduce((sum, sale) => sum + sale.amountPaid, 0),
      totalRemainingBalance: sales.reduce((sum, sale) => sum + sale.remainingBalance, 0),
      totalItems: sales.reduce((sum, sale) => sum + sale.totalQuantity, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discountAmount, 0),
      salesByPaymentMethod: sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'cash';
        if (!acc[method]) {
          acc[method] = { 
            count: 0, 
            amountDue: 0, 
            amountPaid: 0,
            remainingBalance: 0 
          };
        }
        acc[method].count += 1;
        acc[method].amountDue += sale.amountDue;
        acc[method].amountPaid += sale.amountPaid;
        acc[method].remainingBalance += sale.remainingBalance;
        return acc;
      }, {}),
      salesByStatus: sales.reduce((acc, sale) => {
        const status = sale.status || 'pending';
        if (!acc[status]) {
          acc[status] = { 
            count: 0, 
            amountDue: 0, 
            amountPaid: 0,
            remainingBalance: 0 
          };
        }
        acc[status].count += 1;
        acc[status].amountDue += sale.amountDue;
        acc[status].amountPaid += sale.amountPaid;
        acc[status].remainingBalance += sale.remainingBalance;
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
// ✅ SIMPLE VERSION - Get all accounts receivable
export const getAccountsReceivable = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // ALTERNATIVE QUERY: Try this if above doesn't work
    const query = { 
      user: userId,
      $or: [
        { remainingBalance: { $gt: 0 } },
        { amountPaid: { $lt: "$amountDue" } }
      ]
    };

    // Or even simpler:
    // const query = { user: userId };
    // Then filter in JavaScript
    
    const sales = await Sale.find({ user: userId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Filter in JavaScript
    const receivables = sales.filter(sale => 
      sale.remainingBalance > 0 || 
      sale.amountPaid < sale.amountDue
    );

    // Format
    const formattedData = receivables.map(sale => ({
      saleId: sale._id,
      saleNumber: sale.saleNumber,
      customer: sale.customerName || 'Walk-in Customer',
      total: sale.amountDue,
      paid: sale.amountPaid,
      balance: sale.remainingBalance || Math.max(0, sale.amountDue - sale.amountPaid),
      status: sale.status,
      paymentMethod: sale.paymentMethod
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      summary: {
        totalReceivables: formattedData.length,
        totalBalance: formattedData.reduce((sum, item) => sum + item.balance, 0)
      }
    });

  } catch (error) {
    console.error("Accounts receivable error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message
    });
  }
};

// ✅ Add Payment to Sale (Collect Payment)
export const addPaymentToSale = async (req, res) => {
  try {
    const { amount, paymentMethod = 'cash', notes, currency = 'USD' } = req.body;
    const saleId = req.params.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid payment amount is required"
      });
    }

    // Find sale
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Sale not found"
      });
    }

    // Check if sale is already paid in full
    if (sale.status === 'completed' || sale.remainingBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: "Sale is already paid in full"
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

    // Calculate new amounts
    const newAmountPaid = sale.amountPaid + amount;
    const newRemainingBalance = Math.max(0, sale.amountDue - newAmountPaid);
    
    // Prevent overpayment
    if (amount > sale.remainingBalance) {
      return res.status(400).json({
        success: false,
        error: `Payment amount ($${amount}) exceeds remaining balance ($${sale.remainingBalance})`
      });
    }

    // Update sale
    sale.amountPaid = newAmountPaid;
    sale.remainingBalance = newRemainingBalance;
    
    // Update status
    if (newAmountPaid >= sale.amountDue) {
      sale.status = 'completed';
      sale.hasDebt = false;
    } else {
      sale.status = 'partially_paid';
      sale.hasDebt = true;
    }

    // Check if overdue status should be updated
    if (sale.dueDate && new Date() > sale.dueDate && sale.remainingBalance > 0) {
      sale.status = 'overdue';
    }

    // Add to payment history
    sale.paymentHistory.push({
      date: new Date(),
      amount: amount,
      paymentMethod: paymentMethod,
      currency: currency,
      collectedBy: req.user?._id,
      notes: notes || `Payment of ${currency} ${amount} via ${paymentMethod}`
    });

    await sale.save();

    // Get updated sale with populated data
    const updatedSale = await Sale.findById(saleId)
      .populate('user', 'username')
      .populate({
        path: 'paymentHistory.collectedBy',
        select: 'username',
        model: 'User'
      });

    res.status(200).json({
      success: true,
      message: `Payment of ${currency} ${amount} added successfully`,
      data: {
        sale: updatedSale,
        paymentSummary: {
          totalDue: updatedSale.amountDue,
          totalPaid: updatedSale.amountPaid,
          remainingBalance: updatedSale.remainingBalance,
          status: updatedSale.status
        }
      }
    });

  } catch (error) {
    console.error("Error adding payment to sale:", error);
    res.status(500).json({
      success: false,
      error: "Server error while processing payment",
      details: error.message
    });
  }
};

// Add this to your salesController.js file

// ✅ Get Payment Methods Statistics for Dashboard
export const getPaymentMethodsStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = dayjs().startOf('day').toDate();
    
    // Get today's stats
    const todayStats = await Sale.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          totalRemainingBalance: { $sum: "$remainingBalance" },
          totalSales: { $sum: "$grandTotal" }
        }
      },
      {
        $sort: { totalAmountPaid: -1 }
      }
    ]);

    // Get last 7 days stats
    const last7Days = dayjs().subtract(7, 'day').startOf('day').toDate();
    const weeklyStats = await Sale.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          totalSales: { $sum: "$grandTotal" }
        }
      },
      {
        $sort: { totalAmountPaid: -1 }
      }
    ]);

    // Get monthly stats
    const startOfMonth = dayjs().startOf('month').toDate();
    const monthlyStats = await Sale.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          totalSales: { $sum: "$grandTotal" }
        }
      },
      {
        $sort: { totalAmountPaid: -1 }
      }
    ]);

    // Format the response to include all payment methods
    const allPaymentMethods = ['cash', 'zaad', 'edahab', 'credit'];
    
    const formatStats = (stats) => {
      const formatted = {};
      
      // Initialize all payment methods
      allPaymentMethods.forEach(method => {
        formatted[method] = {
          count: 0,
          totalAmountDue: 0,
          totalAmountPaid: 0,
          totalSales: 0,
          totalRemainingBalance: 0
        };
      });
      
      // Populate with actual data
      stats.forEach(stat => {
        if (formatted[stat._id]) {
          formatted[stat._id] = {
            count: stat.count,
            totalAmountDue: stat.totalAmountDue,
            totalAmountPaid: stat.totalAmountPaid,
            totalSales: stat.totalSales,
            totalRemainingBalance: stat.totalRemainingBalance || 0
          };
        }
      });
      
      return formatted;
    };

    res.status(200).json({
      success: true,
      data: {
        today: formatStats(todayStats),
        weekly: formatStats(weeklyStats),
        monthly: formatStats(monthlyStats),
        allPaymentMethods
      },
      summary: {
        todayTotal: todayStats.reduce((sum, stat) => sum + stat.totalAmountPaid, 0),
        weeklyTotal: weeklyStats.reduce((sum, stat) => sum + stat.totalAmountPaid, 0),
        monthlyTotal: monthlyStats.reduce((sum, stat) => sum + stat.totalAmountPaid, 0)
      }
    });
  } catch (error) {
    console.error("Error fetching payment methods stats:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching payment methods statistics",
      details: error.message
    });
  }
};

// ✅ Get Payment Method Transactions (for detailed view)
export const getPaymentMethodTransactions = async (req, res) => {
  try {
    const { method, period = 'today' } = req.params;
    const userId = req.user._id;
    
    // Validate payment method
    const validMethods = ['cash', 'zaad', 'edahab', 'credit'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment method. Valid options: ${validMethods.join(', ')}`
      });
    }
    
    let dateFilter = {};
    const now = dayjs();
    
    switch (period) {
      case 'today':
        dateFilter = {
          $gte: now.startOf('day').toDate(),
          $lte: now.endOf('day').toDate()
        };
        break;
      case 'week':
        dateFilter = {
          $gte: now.subtract(7, 'day').startOf('day').toDate(),
          $lte: now.endOf('day').toDate()
        };
        break;
      case 'month':
        dateFilter = {
          $gte: now.startOf('month').toDate(),
          $lte: now.endOf('month').toDate()
        };
        break;
      default:
        dateFilter = {
          $gte: now.startOf('day').toDate(),
          $lte: now.endOf('day').toDate()
        };
    }
    
    const transactions = await Sale.find({
      user: userId,
      paymentMethod: method,
      createdAt: dateFilter
    })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .lean();
    
    // Calculate totals for this method
    const totals = transactions.reduce((acc, transaction) => ({
      totalAmountDue: acc.totalAmountDue + (transaction.amountDue || 0),
      totalAmountPaid: acc.totalAmountPaid + (transaction.amountPaid || 0),
      totalRemainingBalance: acc.totalRemainingBalance + (transaction.remainingBalance || 0),
      count: acc.count + 1
    }), { totalAmountDue: 0, totalAmountPaid: 0, totalRemainingBalance: 0, count: 0 });
    
    res.status(200).json({
      success: true,
      data: {
        method,
        period,
        transactions,
        totals,
        count: transactions.length
      }
    });
    
  } catch (error) {
    console.error("Error fetching payment method transactions:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching payment method transactions",
      details: error.message
    });
  }
};