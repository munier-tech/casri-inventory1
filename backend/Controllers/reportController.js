import dayjs from "dayjs";
import Sale from "../models/salesModel.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params; // e.g., 2025, 09

    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "username role")
      .populate("product", "name cost");

    if (!sales.length) {
      return res.status(404).json({ message: `wax iib ah lama helin bishan ${month}-${year}` });
    }

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    res.status(200).json({
      message: `Monthly sales for ${month}-${year} fetched`,
      totalSales,
      count: sales.length,
      sales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params; // e.g., 2025

    const start = dayjs(`${year}-01-01`).startOf("year").toDate();
    const end = dayjs(`${year}-12-31`).endOf("year").toDate();

    // Get all sales for the year
    const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } })
      .populate("user", "username role")
      .populate("product", "name cost");

    if (!sales.length) {
      return res.status(404).json({ message: `wax iib ah lama helin sanadkan ${year}` });
    }

    // Calculate yearly total
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthSales = sales.filter(sale => 
        dayjs(sale.createdAt).month() + 1 === month
      );
      
      const monthTotal = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const monthCount = monthSales.length;

      return {
        month,
        monthName: dayjs().month(i).format('MMMM'), // English month name
        monthNameSomali: getSomaliMonthName(month), // Somali month name
        totalSales: monthTotal,
        salesCount: monthCount,
        averageSale: monthCount > 0 ? monthTotal / monthCount : 0
      };
    });

    // Top products for the year
    const yearlyTopProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Populate product names for top products
    const topProductsWithDetails = await Sale.populate(yearlyTopProducts, {
      path: '_id',
      select: 'name cost'
    });

    // Best selling month
    const bestMonth = monthlyBreakdown.reduce((best, current) => 
      current.totalSales > best.totalSales ? current : best, 
      { totalSales: 0, monthName: '' }
    );

    res.status(200).json({
      message: `Yearly sales report for ${year} fetched successfully`,
      year: parseInt(year),
      summary: {
        totalSales,
        totalTransactions: sales.length,
        averageMonthlySales: totalSales / 12,
        bestSellingMonth: {
          month: bestMonth.monthNameSomali,
          sales: bestMonth.totalSales
        }
      },
      monthlyBreakdown,
      topProducts: topProductsWithDetails,
      salesData: {
        totalSales,
        salesCount: sales.length,
        sales // Include all sales data if needed
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ message: "Top products fetched", data: topProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get Somali month names
function getSomaliMonthName(month) {
  const somaliMonths = {
    1: 'Janaayo',
    2: 'Febraayo',
    3: 'Maarso',
    4: 'Abriil',
    5: 'Maayo',
    6: 'Juun',
    7: 'Luuliyo',
    8: 'Agosto',
    9: 'Sebtembar',
    10: 'Oktoobar',
    11: 'Nofembar',
    12: 'Desembar'
  };
  return somaliMonths[month] || 'Bilaash';
}