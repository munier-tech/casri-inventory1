import dayjs from "dayjs";
import Sale from "../models/salesModel.js";
import Purchase from "../models/purchaseModel.js";
import Loan from "../models/loanModel.js";
import Financial from "../models/financialModel.js";
import Product from "../models/productModel.js";

// -------------------- Helper: Somali Month Names --------------------
function getSomaliMonthName(month) {
  const somaliMonths = {
    1: "Janaayo",
    2: "Febraayo",
    3: "Maarso",
    4: "Abriil",
    5: "Maayo",
    6: "Juun",
    7: "Luuliyo",
    8: "Agosto",
    9: "Sebtembar",
    10: "Oktoobar",
    11: "Nofembar",
    12: "Desembar",
  };
  return somaliMonths[month] || "Bilaash";
}

// -------------------- GET DAILY REPORT --------------------
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.params; // expecting 'YYYY-MM-DD'
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    // Fetch Sales
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "username role")
      .populate("product", "name cost");

    // Fetch Purchases
    const purchases = await Purchase.find({ datePurchased: { $gte: start, $lte: end } })
      .populate("user", "username");

    // Fetch Loans
    const loans = await Loan.find({ loanDate: { $gte: start, $lte: end } })
      .populate("createdBy", "username");

    // Fetch Financial Records
    const financials = await Financial.find({ date: { $gte: start, $lte: end } });

    const financialIncomes = [];
    const expenses = [];

    financials.forEach((f) => {
      if (f.income) financialIncomes.push(f.income);
      if (f.expenses && f.expenses.length > 0) expenses.push(...f.expenses);
      if (f.accountsAdjustments && f.accountsAdjustments.length > 0) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    // Calculate Totals
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (b || 0), 0);
    }, 0);

    const totalIncome = totalSales + totalLoans + totalFinancialIncome;
    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.price, 0);
    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    res.status(200).json({
      message: `Daily report for ${date} fetched successfully`,
      sales,
      loans,
      purchases,
      financialIncomes,
      expenses,
      totals: {
        totalIncome,
        totalExpenses,
        balance,
      },
      count: {
        sales: sales.length,
        loans: loans.length,
        purchases: purchases.length,
        financialIncomes: financialIncomes.length,
        expenses: expenses.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET MONTHLY REPORT --------------------
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    // -------------------- Fetch Sales --------------------
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "username role")
      .populate("product", "name cost");

    // -------------------- Fetch Purchases --------------------
    const purchases = await Purchase.find({ datePurchased: { $gte: start, $lte: end } })
      .populate("user", "username");

    // -------------------- Fetch Loans --------------------
    const loans = await Loan.find({ loanDate: { $gte: start, $lte: end } })
      .populate("createdBy", "username");

    // -------------------- Fetch Financial Records --------------------
    const financials = await Financial.find({ date: { $gte: start, $lte: end } });

    const financialIncomes = [];
    const expenses = [];

    financials.forEach((f) => {
      // Collect incomes
      if (f.income) {
        financialIncomes.push(f.income);
      }

      // Collect expenses
      if (f.expenses && f.expenses.length > 0) {
        expenses.push(...f.expenses);
      }

      // Collect accounts adjustments as expenses or adjustments if needed
      if (f.accountsAdjustments && f.accountsAdjustments.length > 0) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    // -------------------- Calculate Totals --------------------
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (b || 0), 0);
    }, 0);

    const totalIncome = totalSales + totalLoans + totalFinancialIncome;

    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.price, 0);

    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    // -------------------- Return JSON --------------------
    res.status(200).json({
      message: `Monthly report for ${month}-${year} fetched successfully`,
      sales,
      loans,
      purchases,
      financialIncomes,
      expenses,
      totals: {
        totalIncome,
        totalExpenses,
        balance,
      },
      count: {
        sales: sales.length,
        loans: loans.length,
        purchases: purchases.length,
        financialIncomes: financialIncomes.length,
        expenses: expenses.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET YEARLY REPORT --------------------
export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params;
    const start = dayjs(`${year}-01-01`).startOf("year").toDate();
    const end = dayjs(`${year}-12-31`).endOf("year").toDate();

    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "username role")
      .populate("product", "name cost");

    const purchases = await Purchase.find({ datePurchased: { $gte: start, $lte: end } })
      .populate("user", "username");

    const loans = await Loan.find({ loanDate: { $gte: start, $lte: end } })
      .populate("createdBy", "username");

    const financials = await Financial.find({ date: { $gte: start, $lte: end } });

    const financialIncomes = [];
    const expenses = [];

    financials.forEach((f) => {
      if (f.income) financialIncomes.push(f.income);
      if (f.expenses && f.expenses.length > 0) expenses.push(...f.expenses);
      if (f.accountsAdjustments && f.accountsAdjustments.length > 0) {
        expenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalFinancialIncome = financialIncomes.reduce((sum, f) => {
      return sum + Object.values(f).reduce((a, b) => a + (b || 0), 0);
    }, 0);
    const totalIncome = totalSales + totalLoans + totalFinancialIncome;

    const totalExpensesFromExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.price, 0);
    const totalExpenses = totalExpensesFromExpenses + totalPurchases;
    const balance = totalIncome - totalExpenses;

    // -------------------- Monthly Breakdown --------------------
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthSales = sales.filter(s => dayjs(s.createdAt).month() + 1 === month);
      const monthLoans = loans.filter(l => dayjs(l.loanDate).month() + 1 === month);
      const monthFinancials = financials.filter(f => dayjs(f.date).month() + 1 === month);
      const monthPurchases = purchases.filter(p => dayjs(p.datePurchased).month() + 1 === month);

      const monthFinancialIncomes = monthFinancials.map(f => f.income);
      const monthExpenses = [];
      monthFinancials.forEach(f => {
        if (f.expenses) monthExpenses.push(...f.expenses);
        if (f.accountsAdjustments) monthExpenses.push(...f.accountsAdjustments.map(a => ({ name: a.label, amount: a.value })));
      });

      const monthTotalSales = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const monthTotalLoans = monthLoans.reduce((sum, l) => sum + l.amount, 0);
      const monthTotalFinancialIncome = monthFinancialIncomes.reduce((sum, f) => sum + Object.values(f).reduce((a,b)=>a+(b||0),0), 0);
      const monthTotalIncome = monthTotalSales + monthTotalLoans + monthTotalFinancialIncome;

      const monthTotalPurchases = monthPurchases.reduce((sum, p) => sum + p.price, 0);
      const monthTotalExpenses = monthExpenses.reduce((sum,e)=>sum+(e.amount||0),0) + monthTotalPurchases;

      return {
        month,
        monthName: dayjs().month(i).format('MMMM'),
        monthNameSomali: getSomaliMonthName(month),
        totalIncome: monthTotalIncome,
        totalExpenses: monthTotalExpenses,
        balance: monthTotalIncome - monthTotalExpenses,
      };
    });

    // -------------------- Top Products --------------------
    const yearlyTopProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$product", totalSold: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalAmount" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const topProductsWithDetails = await Sale.populate(yearlyTopProducts, {
      path: "_id",
      select: "name cost"
    });

    res.status(200).json({
      message: `Yearly sales report for ${year} fetched successfully`,
      year: parseInt(year),
      totals: { totalIncome, totalExpenses, balance },
      monthlyBreakdown,
      topProducts: topProductsWithDetails,
      salesData: { totalSales, salesCount: sales.length, sales }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------- GET TOP PRODUCTS --------------------

