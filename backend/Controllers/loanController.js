import Loan from "../models/loanModel.js";

// ✅ Create Loan
export const createLoan = async (req, res) => {
  try {
    console.log("=== CREATE LOAN REQUEST ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);

    const { personName, productName, amount, description, quantity } = req.body || {};
    
    // Validate required fields
    if (!personName || !productName || !amount) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        success: false,
        error: "Person name, product name, and amount are required",
        received: { 
          personName: !!personName, 
          productName: !!productName, 
          amount: !!amount 
        }
      });
    }

    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Amount must be greater than 0" 
      });
    }

    const loanData = {
      personName: personName.trim(),
      productName: productName.trim(),
      amount: parseFloat(amount),
      description: description ? description.trim() : "",
      quantity: parseInt(quantity) || 1,
      createdBy: req.user?._id || undefined,
    };

    console.log("Creating loan with data:", loanData);

    const loan = new Loan(loanData);
    const savedLoan = await loan.save();
    
    console.log("✅ Loan created successfully:", savedLoan._id);
    
    res.status(201).json({
      success: true,
      message: "Loan created successfully",
      loan: savedLoan
    });
  } catch (error) {
    console.error("❌ Error creating loan:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get All Loans
export const getLoans = async (req, res) => {
  try {
    console.log("=== GET LOANS REQUEST ===");
    console.log("Query params:", req.query);
    
    const { isPaid, startDate, endDate, personName } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by payment status
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filter.loanDate = {};
      if (startDate) filter.loanDate.$gte = new Date(startDate);
      if (endDate) filter.loanDate.$lte = new Date(endDate);
    }
    
    // Filter by person name (case insensitive)
    if (personName) {
      filter.personName = { $regex: personName, $options: 'i' };
    }
    
    console.log("Filter applied:", filter);
    
    const loans = await Loan.find(filter)
      .populate('createdBy', 'name email')
      .sort({ loanDate: -1 });
    
    console.log(`✅ Found ${loans.length} loans`);
    
    // Calculate totals
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const unpaidAmount = loans
      .filter(loan => !loan.isPaid)
      .reduce((sum, loan) => sum + loan.amount, 0);
    const paidAmount = loans
      .filter(loan => loan.isPaid)
      .reduce((sum, loan) => sum + loan.amount, 0);
    
    res.status(200).json({
      success: true,
      count: loans.length,
      totals: {
        total: totalAmount,
        unpaid: unpaidAmount,
        paid: paidAmount
      },
      loans
    });
  } catch (error) {
    console.error("❌ Error fetching loans:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Update Loan
export const updateLoan = async (req, res) => {
  try {
    console.log("=== UPDATE LOAN REQUEST ===");
    console.log("Loan ID:", req.params.id);
    console.log("Update data:", req.body);

    const { personName, productName, amount, description, quantity, isPaid } = req.body;
    
    const updateData = {};
    
    if (personName !== undefined) updateData.personName = personName.trim();
    if (productName !== undefined) updateData.productName = productName.trim();
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (parsedAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          error: "Amount must be greater than 0" 
        });
      }
      updateData.amount = parsedAmount;
    }
    if (description !== undefined) updateData.description = description.trim();
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    
    // Handle payment status change
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid === true || isPaid === 'true';
      if (isPaid) {
        updateData.paidDate = new Date();
      } else {
        updateData.paidDate = null;
      }
    }

    console.log("Processed update data:", updateData);

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!loan) {
      console.log("❌ Loan not found");
      return res.status(404).json({ 
        success: false,
        error: "Loan not found" 
      });
    }

    console.log("✅ Loan updated successfully:", loan._id);
    
    res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      loan
    });
  } catch (error) {
    console.error("❌ Error updating loan:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Delete Loan
export const deleteLoan = async (req, res) => {
  try {
    console.log("=== DELETE LOAN REQUEST ===");
    console.log("Loan ID:", req.params.id);

    const loan = await Loan.findByIdAndDelete(req.params.id);

    if (!loan) {
      console.log("❌ Loan not found");
      return res.status(404).json({ 
        success: false,
        error: "Loan not found" 
      });
    }

    console.log("✅ Loan deleted successfully:", loan._id);
    
    res.status(200).json({
      success: true,
      message: "Loan deleted successfully",
      deletedLoan: loan
    });
  } catch (error) {
    console.error("❌ Error deleting loan:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get Loan by ID
export const getLoanById = async (req, res) => {
  try {
    console.log("=== GET LOAN BY ID REQUEST ===");
    console.log("Loan ID:", req.params.id);

    const loan = await Loan.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!loan) {
      console.log("❌ Loan not found");
      return res.status(404).json({ 
        success: false,
        error: "Loan not found" 
      });
    }

    console.log("✅ Loan found:", loan._id);
    
    res.status(200).json({
      success: true,
      loan
    });
  } catch (error) {
    console.error("❌ Error fetching loan:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Mark Loan as Paid
export const markLoanAsPaid = async (req, res) => {
  try {
    console.log("=== MARK LOAN AS PAID REQUEST ===");
    console.log("Loan ID:", req.params.id);

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { 
        isPaid: true,
        paidDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!loan) {
      console.log("❌ Loan not found");
      return res.status(404).json({ 
        success: false,
        error: "Loan not found" 
      });
    }

    console.log("✅ Loan marked as paid:", loan._id);
    
    res.status(200).json({
      success: true,
      message: "Loan marked as paid successfully",
      loan
    });
  } catch (error) {
    console.error("❌ Error marking loan as paid:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get Loan Statistics
export const getLoanStats = async (req, res) => {
  try {
    console.log("=== GET LOAN STATS REQUEST ===");

    const [totalStats, monthlyStats] = await Promise.all([
      // Total statistics
      Loan.aggregate([
        {
          $group: {
            _id: null,
            totalLoans: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            unpaidLoans: {
              $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] }
            },
            unpaidAmount: {
              $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$amount", 0] }
            },
            paidLoans: {
              $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] }
            },
            paidAmount: {
              $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$amount", 0] }
            }
          }
        }
      ]),
      
      // Monthly statistics for current year
      Loan.aggregate([
        {
          $match: {
            loanDate: {
              $gte: new Date(new Date().getFullYear(), 0, 1),
              $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$loanDate" },
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            unpaidAmount: {
              $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$amount", 0] }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    const stats = totalStats[0] || {
      totalLoans: 0,
      totalAmount: 0,
      unpaidLoans: 0,
      unpaidAmount: 0,
      paidLoans: 0,
      paidAmount: 0
    };

    console.log("✅ Loan statistics calculated");
    
    res.status(200).json({
      success: true,
      stats,
      monthlyStats
    });
  } catch (error) {
    console.error("❌ Error fetching loan statistics:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};