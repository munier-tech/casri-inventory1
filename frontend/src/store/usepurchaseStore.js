// src/store/usePurchaseStore.js
import { create } from "zustand";
import axios from "../lib/axios";

const usePurchaseStore = create((set, get) => ({
  purchases: [],
  dailyPurchases: [],
  loading: false,
  error: null,

  // ✅ Create purchase
  addPurchase: async (purchaseData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/purchases", purchaseData);
      set((state) => ({
        purchases: [...state.purchases, res.data.purchase],
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ✅ Get all purchases
  getAllPurchases: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/purchases");
      set({ purchases: res.data.purchases, loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ✅ Get today’s purchases
  getDailyPurchases: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get("/purchases/daily");
      set({ dailyPurchases: res.data.purchases, loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ✅ Update purchase
  updatePurchase: async (id, updateData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put(`/purchases/${id}`, updateData);
      set((state) => ({
        purchases: state.purchases.map((p) =>
          p._id === id ? res.data.purchase : p
        ),
        loading: false,
      }));
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // ✅ Delete purchase
  deletePurchase: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/purchases/${id}`);
      set((state) => ({
        purchases: state.purchases.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || err.message });
    }
  },
}));

export default usePurchaseStore;
