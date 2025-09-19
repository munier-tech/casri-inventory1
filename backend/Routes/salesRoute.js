import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getDailySales,
  getMyDailySales,
  getUsersDailySales,
  getSalesByDate,
  getAllUsersSalesByDate
} from "../Controllers/salesController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected unless explicitly disabled in development
if (!(process.env.NODE_ENV === "development" && process.env.DISABLE_AUTH_FOR_SALES === "true")) {
  router.use(protectedRoute);
}

router.route("/")
  .get(getSales)
  .post(createSale);

router.route("/:id")
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

// Daily sales routes (NO ObjectId parameters)
router.get("/daily/today", getDailySales);
router.get("/daily/my", getMyDailySales);
router.get("/daily/users", getUsersDailySales);
router.get("/date/:date", getSalesByDate);
router.get("/all/date/:date", getAllUsersSalesByDate);

export default router;