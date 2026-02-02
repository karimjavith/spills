import express, { Request, Response } from 'express';
import { fetchTransactions } from '../services/starling.js';
import { calculateRoundUp } from '../services/roundup.js';
import { log } from '../middleware/observability/logger.js';
import { asString } from '../helpers/index.js';
import { Transaction } from '../models/transactions.js';

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
 * @throws {Object} 400 - Missing required query parameters
 * @throws {Object} 500 - Server error during transaction fetching
 */
router.get('/', async (req: Request, res: Response) => {
  const accountUid = asString(req.query.accountUid);
  const categoryUid = asString(req.query.categoryUid);
  const from = asString(req.query.from);
  const to = asString(req.query.to);

  if (
    typeof accountUid !== 'string' ||
    !accountUid ||
    typeof categoryUid !== 'string' ||
    !categoryUid ||
    typeof from !== 'string' ||
    !from ||
    typeof to !== 'string' ||
    !to
  ) {
    log().warn(
      { query: req.query },
      'Missing required parameters for fetching transactions',
    );
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const transactionFeed = await fetchTransactions(
      accountUid,
      categoryUid,
      from,
      to,
    );

    const transactions: Transaction[] = transactionFeed.map((tx) => ({
      transactionAmount: {
        minorUnits: tx.amount.minorUnits || 0,
        currency: tx.amount.currency || 'GBP',
      },
      transactionTime: tx.transactionTime || '',
      transactionStatus: tx.status,
      transactionId: tx.feedItemUid,
      transactionSpendingCategory: tx.spendingCategory,
      transactionDirection: tx.direction,
      transactionReference: tx.reference,
      transactionCounterPartyName: tx.counterPartyName,
      transactionSource: tx.source,
    }));

    if (transactions.length === 0) {
      return res.json({
        transactions: [],
        totalRoundUp: 0,
        currency: 'GBP',
      });
    }

    // Add roundUp to each transaction
    const transactionsWithRoundUp = transactions.map((tx) => {
      const minorUnits = tx.transactionAmount.minorUnits;
      const roundUp =
        typeof minorUnits === 'number' && tx.transactionDirection === 'OUT'
          ? calculateRoundUp(minorUnits)
          : 0;
      return {
        ...tx,
        roundUp: roundUp,
      };
    });

    const totalRoundUp = transactionsWithRoundUp.reduce(
      (sum, tx) => sum + tx.roundUp,
      0,
    );

    res.json({
      transactions: transactionsWithRoundUp,
      totalRoundUp: Number(totalRoundUp.toFixed(2)),
      currency: transactions[0].transactionAmount.currency || 'GBP',
    });
  } catch (e: unknown) {
    log().error({ err: e }, 'Failed to fetch transactions');
    res.status(500).json({
      message: e instanceof Error ? e.message : 'Failed to fetch transactions',
    });
  }
});

export default router;
