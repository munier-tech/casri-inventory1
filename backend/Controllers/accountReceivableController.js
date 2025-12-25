import Sale from "../models/salesModel.js";
import mongoose from "mongoose";

/// ✅ Get all accounts receivable (corrected version)
export const getAccountsReceivable = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      paymentMethod = 'all',
      search = '',
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    // Build query - SIMPLE AND EFFECTIVE
    const query = { 
      user: userId,
      $or: [
        { remainingBalance: { $gt: 0 } },  // Primary condition
        { amountPaid: { $lt: "$amountDue" } } // Alternative condition
      ]
    };

    // Add status filter if not 'all'
    if (status && status !== 'all') {
      query.status = status;
    } else {
      // Include all statuses that could have debt
      query.status = { $in: ['pending', 'partially_paid', 'overdue'] };
    }

    // Add payment method filter if not 'all'
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query.$or = [
        ...(query.$or || []),
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { saleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = {};
    
    switch(sortBy) {
      case 'balance':
        sortOptions.remainingBalance = sortDirection;
        break;
      case 'date':
        sortOptions.createdAt = sortDirection;
        break;
      case 'customer':
        sortOptions.customerName = sortDirection;
        break;
      case 'dueDate':
        sortOptions.dueDate = sortDirection;
        break;
      default:
        sortOptions.dueDate = sortDirection;
    }

    // Fetch receivables
    const receivableSales = await Sale.find(query)
      .populate('user', 'username name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalCount = await Sale.countDocuments(query);

    // Calculate summary statistics
    const summaryStats = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$remainingBalance" },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          count: { $sum: 1 },
          avgBalance: { $avg: "$remainingBalance" }
        }
      }
    ]);

    // Get status distribution
    const statusDistribution = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          avgBalance: { $avg: "$remainingBalance" }
        }
      }
    ]);

    // Format data with better information
    const formattedData = receivableSales.map(sale => {
      const balance = sale.remainingBalance > 0 ? sale.remainingBalance : Math.max(0, sale.amountDue - sale.amountPaid);
      const isOverdue = sale.dueDate && new Date(sale.dueDate) < new Date();
      
      // Determine status
      let displayStatus = sale.status;
      if (isOverdue && balance > 0) {
        displayStatus = 'overdue';
      } else if (sale.amountPaid > 0 && sale.amountPaid < sale.amountDue) {
        displayStatus = 'partially_paid';
      } else if (sale.amountPaid === 0 && sale.amountDue > 0) {
        displayStatus = 'pending';
      }

      return {
        saleId: sale._id,
        saleNumber: sale.saleNumber,
        customer: sale.customerName || 'Walk-in Customer',
        customerPhone: sale.customerPhone || 'N/A',
        store: sale.user?.username || 'Main Store',
        total: sale.amountDue,
        paid: sale.amountPaid,
        balance: balance,
        dueDate: sale.dueDate,
        saleDate: sale.createdAt,
        status: displayStatus,
        originalStatus: sale.status,
        paymentMethod: sale.paymentMethod,
        daysOutstanding: sale.dueDate 
          ? Math.floor((new Date() - new Date(sale.dueDate)) / (1000 * 60 * 60 * 24))
          : Math.floor((new Date() - new Date(sale.createdAt)) / (1000 * 60 * 60 * 24)),
        isOverdue: isOverdue
      };
    });

    // Calculate additional metrics
    const today = new Date();
    const overdueReceivables = receivableSales.filter(sale => 
      sale.dueDate && new Date(sale.dueDate) < today
    );
    
    const upcomingReceivables = receivableSales.filter(sale => 
      sale.dueDate && 
      new Date(sale.dueDate) >= today && 
      new Date(sale.dueDate) <= new Date(today.setDate(today.getDate() + 7))
    );

    res.status(200).json({
      success: true,
      data: formattedData,
      summary: {
        totalReceivables: totalCount,
        totalBalance: summaryStats[0]?.totalBalance || 0,
        totalAmountDue: summaryStats[0]?.totalAmountDue || 0,
        totalAmountPaid: summaryStats[0]?.totalAmountPaid || 0,
        averageBalance: summaryStats[0]?.avgBalance || 0,
        statusDistribution: statusDistribution,
        overdueCount: overdueReceivables.length,
        overdueBalance: overdueReceivables.reduce((sum, sale) => sum + sale.remainingBalance, 0),
        upcomingCount: upcomingReceivables.length,
        upcomingBalance: upcomingReceivables.reduce((sum, sale) => sum + sale.remainingBalance, 0)
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching receivables:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching accounts receivable",
      details: error.message
    });
  }
};

// Helper function to calculate average days outstanding
const calculateAverageDaysOutstanding = async (query) => {
  try {
    const sales = await Sale.find(query)
      .select('createdAt remainingBalance')
      .lean();
    
    if (sales.length === 0) return 0;
    
    const totalDays = sales.reduce((sum, sale) => {
      const days = Math.floor((new Date() - new Date(sale.createdAt)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / sales.length);
  } catch (error) {
    return 0;
  }
};

// ✅ Collect payment for a receivable
export const collectReceivablePayment = async (req, res) => {
  try {
    const { amount, paymentMethod = 'cash', notes, isFullPayment = false } = req.body;
    const saleId = req.params.id;
    const userId = req.user._id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid payment amount is required"
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'zaad', 'edahab'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment method. Valid options: ${validPaymentMethods.join(', ')}`
      });
    }

    // Find the sale
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Sale not found"
      });
    }

    // Check if sale has remaining balance
    if (sale.remainingBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: "This sale is already paid in full"
      });
    }

    // Determine payment amount
    let paymentAmount = parseFloat(amount);
    if (isFullPayment) {
      paymentAmount = sale.remainingBalance;
    }

    // Prevent overpayment
    if (paymentAmount > sale.remainingBalance) {
      return res.status(400).json({
        success: false,
        error: `Payment amount ($${paymentAmount}) exceeds remaining balance ($${sale.remainingBalance})`
      });
    }

    // Calculate new amounts
    const newAmountPaid = sale.amountPaid + paymentAmount;
    const newRemainingBalance = Math.max(0, sale.amountDue - newAmountPaid);

    // Update sale
    sale.amountPaid = newAmountPaid;
    sale.remainingBalance = newRemainingBalance;
    
    // Update status based on payment
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
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      collectedBy: userId,
      notes: notes || `Payment collected: $${paymentAmount}`
    });

    await sale.save();

    // Get updated sale with populated data
    const updatedSale = await Sale.findById(saleId)
      .populate('user', 'username name storeName');

    // Prepare response
    const responseData = {
      sale: {
        saleId: updatedSale._id,
        saleNumber: updatedSale.saleNumber,
        customer: updatedSale.customerName || 'Walk-in Customer',
        store: updatedSale.user?.storeName || updatedSale.user?.username || 'Main Store',
        total: updatedSale.amountDue,
        paid: updatedSale.amountPaid,
        balance: updatedSale.remainingBalance,
        dueDate: updatedSale.dueDate,
        status: updatedSale.status,
        paymentMethod: updatedSale.paymentMethod
      },
      payment: {
        amount: paymentAmount,
        paymentMethod: paymentMethod,
        collectedAt: new Date(),
        collectedBy: userId,
        notes: notes,
        isFullPayment: paymentAmount === sale.remainingBalance
      },
      summary: {
        previousBalance: sale.remainingBalance + paymentAmount,
        newBalance: updatedSale.remainingBalance,
        amountCollected: paymentAmount,
        paymentPercentage: ((updatedSale.amountPaid / updatedSale.amountDue) * 100).toFixed(1)
      }
    };

    res.status(200).json({
      success: true,
      message: `Payment of $${paymentAmount} collected successfully`,
      data: responseData
    });

  } catch (error) {
    console.error("Error collecting receivable payment:", error);
    res.status(500).json({
      success: false,
      error: "Server error while processing payment",
      details: error.message
    });
  }
};

// ✅ Get receivable details by ID
export const getReceivableDetails = async (req, res) => {
  try {
    const saleId = req.params.id;

    const sale = await Sale.findById(saleId)
      .populate('user', 'username name storeName email phone')
      .populate({
        path: 'products.product',
        select: 'name sku category price cost stock',
        model: 'Product'
      })
      .populate({
        path: 'paymentHistory.collectedBy',
        select: 'username name',
        model: 'User'
      });

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Sale not found"
      });
    }

    // Check if it's actually a receivable
    if (sale.remainingBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: "This sale is not an account receivable (already paid in full)"
      });
    }

    // Calculate additional details
    const createdAt = new Date(sale.createdAt);
    const now = new Date();
    const daysOutstanding = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    const isOverdue = sale.dueDate && new Date(sale.dueDate) < now;
    const daysOverdue = isOverdue 
      ? Math.floor((now - new Date(sale.dueDate)) / (1000 * 60 * 60 * 24))
      : 0;

    const daysUntilDue = sale.dueDate && !isOverdue
      ? Math.ceil((new Date(sale.dueDate) - now) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate payment statistics
    const paymentStats = {
      totalPaid: sale.amountPaid,
      remainingBalance: sale.remainingBalance,
      paymentPercentage: ((sale.amountPaid / sale.amountDue) * 100).toFixed(2),
      numberOfPayments: sale.paymentHistory?.length || 0,
      averagePayment: sale.paymentHistory?.length > 0
        ? (sale.amountPaid / sale.paymentHistory.length).toFixed(2)
        : 0,
      lastPaymentDate: sale.paymentHistory && sale.paymentHistory.length > 0
        ? sale.paymentHistory[sale.paymentHistory.length - 1].date
        : null,
      firstPaymentDate: sale.paymentHistory && sale.paymentHistory.length > 0
        ? sale.paymentHistory[0].date
        : null
    };

    // Group payment history by method
    const paymentsByMethod = {};
    if (sale.paymentHistory) {
      sale.paymentHistory.forEach(payment => {
        const method = payment.paymentMethod || 'unknown';
        if (!paymentsByMethod[method]) {
          paymentsByMethod[method] = {
            total: 0,
            count: 0,
            payments: []
          };
        }
        paymentsByMethod[method].total += payment.amount;
        paymentsByMethod[method].count += 1;
        paymentsByMethod[method].payments.push(payment);
      });
    }

    const receivableDetails = {
      // Basic Info
      saleInfo: {
        saleId: sale._id,
        saleNumber: sale.saleNumber,
        date: sale.createdAt,
        store: sale.user?.storeName || sale.user?.username || 'Main Store',
        salesPerson: sale.user?.username || sale.user?.name,
        status: isOverdue ? 'overdue' : sale.status,
        originalStatus: sale.status
      },
      
      // Customer Info
      customerInfo: {
        name: sale.customerName || 'Walk-in Customer',
        phone: sale.customerPhone,
        email: null // Add if you have customer emails
      },
      
      // Financial Details (matches your table columns)
      financialDetails: {
        total: sale.amountDue,
        paid: sale.amountPaid,
        balance: sale.remainingBalance,
        discountApplied: sale.discountAmount,
        subtotal: sale.subtotal,
        grandTotal: sale.grandTotal,
        paymentMethod: sale.paymentMethod
      },
      
      // Timeline & Status
      timeline: {
        createdAt: sale.createdAt,
        dueDate: sale.dueDate,
        daysOutstanding: daysOutstanding,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue,
        daysUntilDue: daysUntilDue,
        status: isOverdue ? 'overdue' : sale.status
      },
      
      // Products
      products: sale.products.map(item => ({
        productId: item.product?._id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        discount: item.discount,
        itemTotal: item.itemTotal,
        itemDiscount: item.itemDiscount,
        itemNet: item.itemNet
      })),
      
      // Payment History
      paymentHistory: {
        summary: paymentStats,
        byMethod: paymentsByMethod,
        transactions: sale.paymentHistory
          ?.map(payment => ({
            date: payment.date,
            amount: payment.amount,
            method: payment.paymentMethod,
            collectedBy: payment.collectedBy?.username || payment.collectedBy?.name || 'System',
            notes: payment.notes
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)) || []
      },
      
      // Additional Info
      additionalInfo: {
        notes: sale.notes,
        hasDebt: sale.hasDebt,
        changeAmount: sale.changeAmount,
        totalQuantity: sale.totalQuantity
      }
    };

    res.status(200).json({
      success: true,
      data: receivableDetails
    });

  } catch (error) {
    console.error("Error fetching receivable details:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching receivable details",
      details: error.message
    });
  }
};

// ✅ Update receivable (due date, notes, etc.)
export const updateReceivable = async (req, res) => {
  try {
    const saleId = req.params.id;
    const { dueDate, notes, status } = req.body;

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: "Sale not found"
      });
    }

    // Update fields
    if (dueDate !== undefined) {
      sale.dueDate = dueDate ? new Date(dueDate) : null;
    }
    
    if (notes !== undefined) {
      sale.notes = notes;
    }
    
    if (status && ['pending', 'partially_paid', 'overdue'].includes(status)) {
      sale.status = status;
    }

    // Re-check overdue status
    if (sale.dueDate && new Date() > sale.dueDate && sale.remainingBalance > 0) {
      sale.status = 'overdue';
    }

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Receivable updated successfully",
      data: {
        saleId: sale._id,
        dueDate: sale.dueDate,
        notes: sale.notes,
        status: sale.status,
        remainingBalance: sale.remainingBalance
      }
    });

  } catch (error) {
    console.error("Error updating receivable:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating receivable",
      details: error.message
    });
  }
};

// ✅ Get receivable summary statistics
export const getReceivableSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total receivables
    const totalReceivablesAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          status: { $in: ['pending', 'partially_paid', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$remainingBalance" },
          count: { $sum: 1 },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" },
          avgBalance: { $avg: "$remainingBalance" },
          minBalance: { $min: "$remainingBalance" },
          maxBalance: { $max: "$remainingBalance" }
        }
      }
    ]);

    const totalReceivables = totalReceivablesAgg[0] || {
      totalBalance: 0,
      count: 0,
      totalAmountDue: 0,
      totalAmountPaid: 0,
      avgBalance: 0,
      minBalance: 0,
      maxBalance: 0
    };

    // Get receivables by status
    const byStatusAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          status: { $in: ['pending', 'partially_paid', 'overdue'] }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          avgDaysOutstanding: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                86400000 // milliseconds in a day
              ]
            }
          }
        }
      },
      { $sort: { totalBalance: -1 } }
    ]);

    // Get overdue receivables
    const overdueAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          dueDate: { $lt: new Date() },
          status: { $in: ['pending', 'partially_paid', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          avgDaysOverdue: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), "$dueDate"] },
                86400000
              ]
            }
          }
        }
      }
    ]);

    const overdue = overdueAgg[0] || { count: 0, totalBalance: 0, avgDaysOverdue: 0 };

    // Get upcoming due (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          dueDate: {
            $gte: new Date(),
            $lte: nextWeek
          },
          status: { $in: ['pending', 'partially_paid'] }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          earliestDueDate: { $min: "$dueDate" },
          latestDueDate: { $max: "$dueDate" }
        }
      }
    ]);

    const upcoming = upcomingAgg[0] || { 
      count: 0, 
      totalBalance: 0, 
      earliestDueDate: null, 
      latestDueDate: null 
    };

    // Get receivables by payment method
    const byPaymentMethodAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          status: { $in: ['pending', 'partially_paid', 'overdue'] }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          avgBalance: { $avg: "$remainingBalance" }
        }
      },
      { $sort: { totalBalance: -1 } }
    ]);

    // Get oldest receivable
    const oldestReceivable = await Sale.findOne({
      user: userId,
      remainingBalance: { $gt: 0 },
      status: { $in: ['pending', 'partially_paid', 'overdue'] }
    })
    .sort({ createdAt: 1 })
    .select('createdAt customerName remainingBalance saleNumber')
    .lean();

    // Get customers with highest balances
    const topCustomersAgg = await Sale.aggregate([
      {
        $match: {
          user: userId,
          remainingBalance: { $gt: 0 },
          status: { $in: ['pending', 'partially_paid', 'overdue'] },
          customerName: { $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: "$customerName",
          count: { $sum: 1 },
          totalBalance: { $sum: "$remainingBalance" },
          totalAmountDue: { $sum: "$amountDue" },
          totalAmountPaid: { $sum: "$amountPaid" }
        }
      },
      { $sort: { totalBalance: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReceivables,
        byStatus: byStatusAgg,
        overdue,
        upcoming,
        byPaymentMethod: byPaymentMethodAgg,
        topCustomers: topCustomersAgg,
        oldestReceivable: oldestReceivable || null,
        summary: {
          totalCustomers: await Sale.distinct('customerName', {
            user: userId,
            remainingBalance: { $gt: 0 },
            status: { $in: ['pending', 'partially_paid', 'overdue'] },
            customerName: { $ne: null, $ne: '' }
          }).then(names => names.length),
          averageDaysOutstanding: totalReceivables.count > 0
            ? await calculateAverageDaysOutstanding({
                user: userId,
                remainingBalance: { $gt: 0 },
                status: { $in: ['pending', 'partially_paid', 'overdue'] }
              })
            : 0
        }
      }
    });

  } catch (error) {
    console.error("Error fetching receivable summary:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching receivable summary",
      details: error.message
    });
  }
};

// ✅ Search receivables by customer
export const searchReceivablesByCustomer = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user._id;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      });
    }

    const receivables = await Sale.find({
      user: userId,
      remainingBalance: { $gt: 0 },
      status: { $in: ['pending', 'partially_paid', 'overdue'] },
      $or: [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { saleNumber: { $regex: search, $options: 'i' } }
      ]
    })
    .populate('user', 'username storeName')
    .select('saleNumber customerName customerPhone amountDue amountPaid remainingBalance dueDate status')
    .sort({ dueDate: 1 })
    .limit(20)
    .lean();

    // Group by customer
    const customersMap = {};
    receivables.forEach(sale => {
      const customerKey = sale.customerName || 'Unknown';
      if (!customersMap[customerKey]) {
        customersMap[customerKey] = {
          customerName: sale.customerName || 'Unknown',
          phone: sale.customerPhone,
          totalBalance: 0,
          totalDue: 0,
          totalPaid: 0,
          receivables: [],
          count: 0
        };
      }
      
      customersMap[customerKey].totalBalance += sale.remainingBalance;
      customersMap[customerKey].totalDue += sale.amountDue;
      customersMap[customerKey].totalPaid += sale.amountPaid;
      customersMap[customerKey].count += 1;
      customersMap[customerKey].receivables.push({
        saleId: sale._id,
        saleNumber: sale.saleNumber,
        amountDue: sale.amountDue,
        amountPaid: sale.amountPaid,
        remainingBalance: sale.remainingBalance,
        dueDate: sale.dueDate,
        status: sale.status
      });
    });

    const customers = Object.values(customersMap).sort((a, b) => b.totalBalance - a.totalBalance);

    res.status(200).json({
      success: true,
      data: customers,
      count: receivables.length,
      customerCount: customers.length
    });

  } catch (error) {
    console.error("Error searching receivables:", error);
    res.status(500).json({
      success: false,
      error: "Server error while searching receivables",
      details: error.message
    });
  }
};// Add this to your accountsReceivableController.js
export const testReceivables = async (req, res) => {
  try {
    console.log("=== TEST RECEIVABLES ENDPOINT ===");
    
    // Test 1: Count all sales
    const totalSales = await Sale.countDocuments();
    console.log("Total sales in database:", totalSales);
    
    // Test 2: Count sales with remainingBalance > 0
    const salesWithBalance = await Sale.find({
      remainingBalance: { $gt: 0 }
    }).limit(5);
    
    console.log("Sales with balance (>0):", salesWithBalance.length);
    console.log("Sample sales:", salesWithBalance.map(s => ({
      id: s._id,
      customer: s.customerName,
      total: s.amountDue,
      paid: s.amountPaid,
      balance: s.remainingBalance,
      status: s.status
    })));
    
    // Test 3: Check if req.user exists
    console.log("Request user:", req.user);
    console.log("User ID:", req.user?._id);
    
    res.status(200).json({
      success: true,
      debug: {
        totalSales,
        salesWithBalance: salesWithBalance.length,
        sampleData: salesWithBalance.map(s => ({
          id: s._id,
          customer: s.customerName,
          total: s.amountDue,
          paid: s.amountPaid,
          balance: s.remainingBalance,
          status: s.status
        })),
        userId: req.user?._id,
        userExists: !!req.user
      }
    });
    
  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};