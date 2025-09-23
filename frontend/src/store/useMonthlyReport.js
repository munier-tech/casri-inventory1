import { create } from "zustand";
import axios from "../lib/axios"; // your custom Axios instance

const useSalesReportStore = create((set) => ({
  monthlyReport: null,
  topProducts: [],
  loading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,

  // -------------------- SET SELECTED DATE --------------------
  setSelectedDate: (year, month) => {
    set({ selectedYear: year, selectedMonth: month });
  },

  // -------------------- FETCH MONTHLY REPORT --------------------
  fetchMonthlyReport: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/reports/MonthlyReport/${year}/${month}`);
      // Backend returns { message: "...", totalSales: X, count: Y, sales: [...] }
      const reportData = res.data;
      set({ 
        monthlyReport: reportData, 
        loading: false 
      });
      return reportData;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch monthly report", 
        monthlyReport: null,
        loading: false 
      });
      throw err;
    }
  },

  // -------------------- FETCH TOP PRODUCTS --------------------
  fetchTopProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/reports/bestSelling");
      // Backend returns { message: "...", data: [...] }
      const topProductsData = res.data.data || res.data;
      set({ 
        topProducts: Array.isArray(topProductsData) ? topProductsData : [], 
        loading: false 
      });
      return topProductsData;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch top products", 
        topProducts: [],
        loading: false 
      });
      throw err;
    }
  },

  // -------------------- CLEAR ERROR --------------------
  clearError: () => {
    set({ error: null });
  },

  // -------------------- CLEAR MONTHLY REPORT --------------------
  clearMonthlyReport: () => {
    set({ monthlyReport: null });
  },

  // -------------------- CLEAR ALL DATA --------------------
  clearAllData: () => {
    set({ 
      monthlyReport: null, 
      topProducts: [], 
      error: null 
    });
  }
}));

export default useSalesReportStore;