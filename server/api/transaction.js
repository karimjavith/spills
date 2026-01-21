import express from 'express';
import { fetchTransactions } from '../services/starling.js';
import { calculateRoundUp } from '../services/roundUp.js';

/**
 * Express router for transaction-related API endpoints.
 * Handles fetching transactions with calculated round-up amounts including totals and setting the base currency from transactions.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * GET /api/transactions
 * Fetches transactions for a specific account and category within a date range,
 * calculates round-up amounts for each transaction, and returns the total.
 *
 * @route GET /
 * @queryparam {string} accountUid - The unique identifier of the account
 * @queryparam {string} categoryUid - The unique identifier of the spending category
 * @queryparam {string} from - Start date in YYYY-MM-DD format
 * @queryparam {string} to - End date in YYYY-MM-DD format
 * @returns {Object} 200 - Success response with transactions, individual round-ups, and total
 * @returns {Object} 400 - Missing required query parameters
 * @returns {Object} 500 - Server error during transaction fetching
 */
router.get('/', async (req, res) => {
  const { accountUid, categoryUid, from, to } = req.query;

  if (!accountUid || !categoryUid || !from || !to) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const transactions = await fetchTransactions(
      accountUid,
      categoryUid,
      from,
      to,
    );

    // Add roundUp to each transaction
    const transactionsWithRoundUp = transactions.map((tx) => ({
      ...tx,
      roundUp: Number(calculateRoundUp(tx.amount.minorUnits).toFixed(2)),
    }));

    const totalRoundUp = transactionsWithRoundUp.reduce(
      (sum, tx) => sum + tx.roundUp,
      0,
    );

    res.json({
      transactions: transactionsWithRoundUp,
      totalRoundUp: Number(totalRoundUp.toFixed(2)),
      currency: transactions[0]?.amount.currency || 'GBP',
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message || 'Failed to fetch transactions' });
  }
});

export default router;
