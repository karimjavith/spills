import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../server.js';

// Partial mock using vi.importActual
vi.mock('../services/starling.js', async () => {
  const actual = await vi.importActual('../services/starling.js');
  return {
    ...actual,
    fetchTransactions: vi.fn(),
  };
});

describe('GET /api/transactions', () => {
  let fetchTransactions;

  beforeEach(async () => {
    // Always get the mock after vi.mock has run
    ({ fetchTransactions } = await import('../services/starling.js'));
    vi.clearAllMocks();
  });

  it('should return transactions with roundUp and totalRoundUp', async () => {
    fetchTransactions.mockResolvedValue([
      {
        feedItemUid: '1',
        amount: { minorUnits: 435, currency: 'GBP' },
        reference: 'Coffee',
      },
      {
        feedItemUid: '2',
        amount: { minorUnits: 520, currency: 'GBP' },
        reference: 'Lunch',
      },
      {
        feedItemUid: '3',
        amount: { minorUnits: 87, currency: 'GBP' },
        reference: 'Snack',
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
    fetchTransactions.mockImplementation(() => {
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
