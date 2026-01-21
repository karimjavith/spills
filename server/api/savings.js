import express from 'express';
import {
  createSavingsGoal,
  getSavingsGoals,
  transferToSavingsGoal,
} from '../services/starling.js';

/**
 * Express router for savings-related API endpoints.
 * Handles savings goal creation, retrieval, and money transfers.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * GET /api/savings/goals
 * Retrieves all savings goals for a specific account.
 *
 * @route GET /goals
 * @queryparam {string} accountUid - The unique identifier of the account
 * @returns {Array} 200 - Array of savings goal objects
 * @returns {Object} 400 - Missing accountUid parameter
 * @returns {Object} 500 - Server error during savings goal retrieval
 */
router.get('/goals', async (req, res) => {
  const { accountUid } = req.query;
  if (!accountUid) {
    return res.status(400).json({ error: 'Missing accountUid' });
  }
  try {
    const goals = await getSavingsGoals(accountUid);
    res.json(goals);
  } catch (e) {
    res
      .status(500)
      .json({ error: e?.message || 'Failed to fetch savings goals' });
  }
});

/**
 * POST /api/savings/goals
 * Creates a new savings goal for a specific account.
 *
 * @route POST /goals
 * @bodyparam {string} accountUid - The unique identifier of the account
 * @bodyparam {string} name - The name of the savings goal
 * @bodyparam {string} currency - The currency code (e.g., 'GBP', 'EUR')
 * @bodyparam {number} amount - The target amount in minor units (e.g., pence)
 * @returns {Object} 200 - The created savings goal object
 * @returns {Object} 400 - Missing required body parameters
 * @returns {Object} 500 - Server error during savings goal creation
 */
router.post('/goals', async (req, res) => {
  const { accountUid, name, currency, amount } = req.body;
  if (!accountUid || !name || !currency || !amount) {
    console.log('Missing params:', req.body);
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  try {
    const result = await createSavingsGoal(accountUid, name, currency, amount);
    res.json(result);
  } catch (e) {
    res
      .status(500)
      .json({ error: e?.message || 'Failed to create savings goal' });
  }
});

/**
 * POST /api/savings/transfer
 * Transfers money from the transactions to a specific savings goal.
 *
 * @route POST /transfer
 * @bodyparam {string} accountUid - The unique identifier of the account
 * @bodyparam {string} savingsGoalUid - The unique identifier of the savings goal
 * @bodyparam {number} amount - The amount to transfer (in major units, will be converted)
 * @bodyparam {string} currency - The currency code (e.g., 'GBP', 'EUR')
 * @returns {Object} 200 - Transfer confirmation response
 * @returns {Object} 400 - Missing required body parameters
 * @returns {Object} 500 - Server error during transfer
 */
router.post('/transfer', async (req, res) => {
  const { accountUid, savingsGoalUid, amount, currency } = req.body;
  if (!accountUid || !savingsGoalUid || !amount || !currency) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await transferToSavingsGoal(
      accountUid,
      savingsGoalUid,
      amount,
      currency,
    );
    res.json(result);
  } catch (e) {
    res
      .status(500)
      .json({ error: e?.message || 'Failed to transfer to savings goal' });
  }
});

export default router;
