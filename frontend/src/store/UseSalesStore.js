import { create } from "zustand";
import axios from "../lib/axios";

const useSalesStore = create((set) => ({
  sales: [],
  dailySales: [],
  usersDailySales: [],
  salesByDate: [],
  allUsersSalesByDate: [],
  loading: false,
  error: null,
  total: 0,

  // -------------------- BASIC CRUD --------------------
  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/sales");
      set({ sales: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch sales", loading: false });
    }
  },

  createSale: async (saleData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/sales", saleData);
      set((state) => ({ 
        sales: [res.data.sale, ...state.sales],
        loading: false 
      }));
      return res.data;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to create sale",
        loading: false 
      });
      throw err;
    }
  },

  updateSale: async (saleId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/sales/${saleId}`, updatedData);
      set((state) => ({
        sales: state.sales.map((sale) => (sale._id === saleId ? res.data.sale : sale)),
        loading: false
      }));
      return res.data;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to update sale",
        loading: false 
      });
      throw err;
    }
  },

  deleteSale: async (saleId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/sales/${saleId}`);
      set((state) => ({
        sales: state.sales.filter((sale) => sale._id !== saleId),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to delete sale",
        loading: false 
      });
      throw err;
    }
  },

  // -------------------- DAILY & DATE-BASED --------------------
  fetchDailySales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/sales/daily/today");
      set({ 
        dailySales: res.data,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch daily sales",
        loading: false 
      });
    }
  },

  fetchUsersDailySales: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/sales/daily/users");
      set({ 
        usersDailySales: res.data,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch users daily sales",
        loading: false 
      });
    }
  },

  fetchSalesByDate: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/date/${date}`);
      set({ 
        salesByDate: res.data,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch sales by date",
        loading: false 
      });
    }
  },

  fetchAllUsersSalesByDate: async (date) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/sales/all/date/${date}`);
      set({ 
        allUsersSalesByDate: res.data,
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch all users sales by date",
        loading: false 
      });
    }
  },
}));

export default useSalesStore;