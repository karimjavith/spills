import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../app.js';

import * as starling from '../services/starling.js';
vi.mock('../services/starling.js', () => ({
  fetchTransactions: vi.fn(),
}));

const fetchTransactionsMock = vi.mocked(starling.fetchTransactions);

describe('GET /api/transactions', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should return transactions with roundUp and totalRoundUp', async () => {
    fetchTransactionsMock.mockResolvedValue([
      {
        feedItemUid: '1',
        amount: { minorUnits: 435, currency: 'GBP' },
        reference: 'Coffee',
        direction: 'OUT',
        status: 'SETTLED',
      },
      {
        feedItemUid: '2',
        amount: { minorUnits: 520, currency: 'GBP' },
        reference: 'Lunch',
        direction: 'OUT',
        status: 'SETTLED',
      },
      {
        feedItemUid: '3',
        amount: { minorUnits: 87, currency: 'GBP' },
        reference: 'Snack',
        direction: 'OUT',
        status: 'SETTLED',
      },
    ]);
    const res = await request(app).get('/api/transactions').query({
      accountUid: '190-200',
      categoryUid: '190-201',
      from: '2026-01-19',
      to: '2026-01-25',
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.transactions[0]).toHaveProperty('roundUp', 0.65);
    expect(res.body.transactions[1]).toHaveProperty('roundUp', 0.8);
    expect(res.body.transactions[2]).toHaveProperty('roundUp', 0.13);
    expect(res.body.totalRoundUp).toBeCloseTo(0.65 + 0.8 + 0.13, 2);
    expect(res.body.currency).toBe('GBP');
  });

  it('should return 400 for missing params', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 500 if fetchTransactions throws', async () => {
    fetchTransactionsMock.mockImplementation(() => {
      throw new Error('Starling API failure');
    });

    const res = await request(app).get('/api/transactions').query({
      accountUid: '190-200',
      categoryUid: '190-201',
      from: '2026-01-19',
      to: '2026-01-25',
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/Starling API failure/);
  });
});
