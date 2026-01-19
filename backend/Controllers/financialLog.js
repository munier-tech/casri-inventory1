import Financial from "../models/financialModel.js";
import dayjs from "dayjs";

// CREATE LOG (with optional user-specified date)
export const createFinancialIncome = async (req, res) => {
  try {
    const {
      income = {},
      accountsAdjustments = [],
      expenses = [],
      date // 👈 accept date from req.body
    } = req.body;

    const incomeTotal =
      (income.zdollar || 0) +
      (income.zcash || 0) +
      (income.edahabCash || 0) +
      (income.Cash || 0) +
      (income.dollar || 0) +
      (income.account || 0);

    const adjustmentsTotal = accountsAdjustments.reduce(
      (sum, adj) => sum + (adj.value || 0),
      0
    );

    const expensesTotal = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const combinedTotal = incomeTotal + expensesTotal;
    const balance = combinedTotal + adjustmentsTotal;

    const newFinancialLog = new Financial({
      income,
      accountsAdjustments,
      expenses,
      date: date ? dayjs(date).toDate() : undefined, // 👈 set date if provided
      totals: {
        incomeTotal,
        adjustmentsTotal,
        combinedTotal,
        expensesTotal,
        balance
      }
    });

    await newFinancialLog.save();

    res.status(201).json({
      message: "Financial log created successfully",
      data: newFinancialLog
    });
  } catch (error) {
    console.error("Error in creating financial log", error);
    res.status(500).json({ message: error.message });
  }
};

// GET LOGS BY DATE
export const getFinancialLogsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const logs = await Financial.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No data found for this specific date" });
    }

    res.status(200).json({ data: logs });
  } catch (error) {
    console.error("Error fetching financial logs by date:", error);
    res.status(500).json({ message: error.message });
  }
};





export const updateFinancialLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { income, accountsAdjustments, expenses, date } = req.body;

    if (!income && !accountsAdjustments && !expenses && !date) {
      return res.status(400).json({ message: "At least one field is required to update." });
    }

    const financialLog = await Financial.findById(id);
    if (!financialLog) {
      return res.status(404).json({ message: "Financial log not found" });
    }

    // Update fields if provided
    financialLog.income = income || financialLog.income;
    financialLog.accountsAdjustments = accountsAdjustments || financialLog.accountsAdjustments;
    financialLog.expenses = expenses || financialLog.expenses;
    financialLog.date = date ? dayjs(date).toDate() : financialLog.date;

    // Recalculate totals
    const incomeTotal =
      (financialLog.income.zdollar || 0) +
      (financialLog.income.zcash || 0) +
      (financialLog.income.edahabCash || 0) +
      (financialLog.income.Cash || 0) +
      (financialLog.income.dollar || 0) +
      (financialLog.income.account || 0);

    const adjustmentsTotal = (financialLog.accountsAdjustments || []).reduce(
      (sum, adj) => sum + (adj.value || 0),
      0
    );

    const expensesTotal = (financialLog.expenses || []).reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const combinedTotal = incomeTotal + expensesTotal;
    const balance = combinedTotal + adjustmentsTotal;

    financialLog.totals = {
      incomeTotal,
      adjustmentsTotal,
      expensesTotal,
      combinedTotal,
      balance
    };

    await financialLog.save();

    res.status(200).json({
      message: "Financial log successfully updated.",
      data: financialLog
    });
  } catch (error) {
    console.error("Error in updating financial log:", error);
    res.status(500).json({ message: error.message });
  }
};

