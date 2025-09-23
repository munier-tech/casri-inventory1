import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { getMonthlyReport, getTopProducts, getYearlyReport } from "../Controllers/reportController.js";
const router = express.Router();



router.get("/MonthlyReport/:year/:month" , protectedRoute , getMonthlyReport)
router.get("/YearlyReport/:year", protectedRoute, getYearlyReport);
router.get("/bestSelling" , protectedRoute , getTopProducts)




export default router