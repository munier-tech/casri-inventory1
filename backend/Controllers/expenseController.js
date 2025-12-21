import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      amountDue,
      amountPaid,
      expenseType,
      paymentMethod,
      description,
      dueDate
    } = req.body;

    // Validate amount paid doesn't exceed amount due
    if (amountPaid > amountDue) {
      return res.status(400).json({
        success: false,
        error: 'Amount paid cannot exceed amount due'
      });
    }

    const expense = await Expense.create({
      clientName,
      clientPhone,
      amountDue,
      amountPaid,
      expenseType,
      paymentMethod: paymentMethod || 'Cash',
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      expenseType,
      paymentMethod,
      status,
      clientName,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    // Filters
    if (expenseType) query.expenseType = expenseType;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;
    if (clientName) {
      query.clientName = { $regex: clientName, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amountDue = {};
      if (minAmount) query.amountDue.$gte = parseFloat(minAmount);
      if (maxAmount) query.amountDue.$lte = parseFloat(maxAmount);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    // Calculate summary statistics
    const summary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmountDue: { $sum: '$amountDue' },
          totalAmountPaid: { $sum: '$amountPaid' },
          totalBalance: { $sum: { $subtract: ['$amountDue', '$amountPaid'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      summary: summary[0] || {
        totalAmountDue: 0,
        totalAmountPaid: 0,
        totalBalance: 0,
        count: 0
      },
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      amountDue,
      amountPaid,
      expenseType,
      paymentMethod,
      description,
      dueDate
    } = req.body;

    // Validate amount paid doesn't exceed amount due
    if (amountPaid > amountDue) {
      return res.status(400).json({
        success: false,
        error: 'Amount paid cannot exceed amount due'
      });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        clientName,
        clientPhone,
        amountDue,
        amountPaid,
        expenseType,
        paymentMethod,
        description,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats/summary
// @access  Private
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { user: new mongoose.Types.ObjectId(req.user._id) };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Statistics by expense type
    const statsByType = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$expenseType',
          totalAmountDue: { $sum: '$amountDue' },
          totalAmountPaid: { $sum: '$amountPaid' },
          totalBalance: { $sum: { $subtract: ['$amountDue', '$amountPaid'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmountDue: -1 } }
    ]);

    // Statistics by payment method
    const statsByPaymentMethod = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Statistics by status
    const statsByStatus = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          totalAmountDue: { $sum: '$amountDue' },
          totalAmountPaid: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmountDue: { $sum: '$amountDue' },
          totalAmountPaid: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: statsByType,
        byPaymentMethod: statsByPaymentMethod,
        byStatus: statsByStatus,
        monthlyTrends,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};