import express from 'express';
import { getAccounts } from '../services/starling.js';

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
 * @returns {Object} 500 - Server error during account retrieval
 */
router.get('/', async (req, res) => {
  try {
    const accounts = await getAccounts();
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Failed to fetch accounts' });
  }
});

export default router;
