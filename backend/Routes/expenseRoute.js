import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} from '../Controllers/expenseController.js';
import protectedRoute from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protectedRoute)

router.route('/')
  .post(createExpense)
  .get(getExpenses);

router.route('/stats/summary')
  .get(getExpenseStats);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;