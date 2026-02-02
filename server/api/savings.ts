import express, { Request, Response } from 'express';
import {
  getSavingsGoals,
  createSavingsGoal,
  transferToSavingsGoal,
} from '../services/starling.js';
import { log } from '../middleware/observability/logger.js';
import { asNumber, asString } from '../helpers/index.js';
import { SavingsGoal } from '../models/savings-goal.js';

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
 * @throws {Object} 400 - Missing accountUid parameter
 * @throws {Object} 500 - Server error during savings goal retrieval
 */
router.get('/goals', async (req: Request, res: Response) => {
  const accountUid = asString(req.query.accountUid);
  if (typeof accountUid !== 'string' || !accountUid) {
    return res.status(400).json({ error: 'Missing accountUid' });
  }
  try {
    const savingsGoals = await getSavingsGoals(accountUid);
    const goals: SavingsGoal[] = savingsGoals.map((goal) => ({
      id: goal.savingsGoalUid,
      name: goal.name,
      target: goal.target?.minorUnits || 0,
      totalSaved: goal.totalSaved?.minorUnits || 0,
      currency: goal.totalSaved?.currency,
    }));
    log().info({ goals }, 'Fetched savings goals successfully');
    res.json(goals);
  } catch (e: unknown) {
    log().error({ err: e }, 'Failed to fetch savings goals');
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Failed to fetch savings goals',
    });
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
 * @throws {Object} 400 - Missing required body parameters
 * @throws {Object} 500 - Server error during savings goal creation
 */
router.post('/goals', async (req: Request, res: Response) => {
  const body = {
    accountUid: asString(req.body.accountUid),
    name: asString(req.body.name),
    currency: asString(req.body.currency),
    amount: asNumber(req.body.amount),
  };
  const { accountUid, name, currency, amount } = body;
  if (!accountUid || !name || !currency || typeof amount !== 'number') {
    log().warn(
      { body: req.body },
      'Missing required parameters for creating savings goal',
    );
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  try {
    const result = await createSavingsGoal(accountUid, name, currency, amount);
    log().info({ result }, 'Created savings goal successfully');
    res.json(result);
  } catch (e: unknown) {
    log().error({ err: e }, 'Failed to create savings goal');
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Failed to create savings goal',
    });
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
 * @throws {Object} 400 - Missing required body parameters
 * @throws {Object} 500 - Server error during transfer
 */
router.post('/transfer', async (req: Request, res: Response) => {
  const body = {
    accountUid: asString(req.body.accountUid),
    savingsGoalUid: asString(req.body.savingsGoalUid),
    amount: asNumber(req.body.amount),
    currency: asString(req.body.currency),
  };
  const { accountUid, savingsGoalUid, amount, currency } = body;
  if (
    !accountUid ||
    !savingsGoalUid ||
    !currency ||
    typeof amount !== 'number'
  ) {
    log().warn(
      { body: req.body },
      'Missing required parameters for transferring to savings goal',
    );
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await transferToSavingsGoal(
      accountUid,
      savingsGoalUid,
      amount,
      currency,
    );
    log().info({ result }, 'Transferred to savings goal successfully');
    res.json(result);
  } catch (e: unknown) {
    log().error({ err: e }, 'Failed to transfer to savings goal');
    res.status(500).json({
      error:
        e instanceof Error ? e.message : 'Failed to transfer to savings goal',
    });
  }
});

export default router;
