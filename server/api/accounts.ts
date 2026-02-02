import express, { Request, Response } from 'express';
import { getAccounts } from '../services/starling.js';
import { log } from '../middleware/observability/logger.js';
import { Account } from '../models/account.js';

/**
 * Express router for account-related API endpoints.
 * Handles fetching user bank account information.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * GET /api/accounts
 * Retrieves all bank accounts for the authenticated user.
 *
 * @route GET /
 * @returns {Array} 200 - Array of account objects with account details
 * @throws {Object} 500 - Server error during account retrieval
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const fetchAccounts = await getAccounts();
    const accounts: Account[] = fetchAccounts.map((acc) => ({
      id: acc.accountUid,
      name: acc.name || 'Unnamed Account',
      type: acc.accountType,
      categoryId: acc.defaultCategory,
    }));
    log().info({ accounts }, 'Fetched accounts successfully');
    res.json(accounts);
  } catch (e: unknown) {
    log().error({ err: e }, 'Failed to fetch accounts');
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Failed to fetch accounts',
    });
  }
});

export default router;
