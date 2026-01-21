import { describe, it, expect, vi } from 'vitest';
import * as api from './index';

global.fetch = vi.fn();

describe('API client', () => {
  it('returns accounts on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [{ accountUid: '199-201' }] }),
      text: async () => '',
    });
    const data = await api.getAccounts();
    expect(data).toEqual({ accounts: [{ accountUid: '199-201' }] });
  });

  it('returns error on account fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => 'Error fetching accounts',
    });
    await expect(api.getAccounts()).rejects.toThrow('Failed to fetch accounts');
  });

  it('fetches list of transactions successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalRoundUp: 0,
        currency: 'GBP',
        transactions: [
          {
            feedItemUid: 'tx-1',
            amount: { minorUnits: 100, currency: 'GBP' },
            roundUp: 0,
          },
        ],
      }),
      text: async () => '',
    });

    const data = await api.getTransactions(
      '200-201',
      '199-200',
      new Date(),
      new Date(),
    );
    expect(data).toEqual({
      totalRoundUp: 0,
      currency: 'GBP',
      transactions: [
        {
          feedItemUid: 'tx-1',
          amount: { minorUnits: 100, currency: 'GBP' },
          roundUp: 0,
        },
      ],
    });
  });

  it('returns error on transactions fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error fetching transactions',
    });
    await expect(
      api.getTransactions('200-201', '199-200', new Date(), new Date()),
    ).rejects.toThrow('Error fetching transactions');
  });

  it('throws a parsed error for transactions', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        errors: [{ message: 'MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP' }],
      }),
      text: async () =>
        '{"errors":[{"message":"MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP"}]}',
    });
    try {
      await api.getTransactions('199-200', '200-201', new Date(), new Date());
    } catch (error) {
      const parsedError = JSON.parse(error.message).errors[0].message;
      expect(parsedError).toBe('MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP');
    }
  });

  it('creates savings goal successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ savingsGoalUid: '200-201' }),
      text: async () => '',
    });
    const data = await api.createSavingsGoal('199-200', 'My Goal', 1000);
    expect(data).toEqual({ savingsGoalUid: '200-201' });
  });

  it('returns error on savings goal creation failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => 'Error creating savings goal',
    });
    await expect(
      api.createSavingsGoal('199-200', 'My Goal', 1000),
    ).rejects.toThrow('Failed to create savings goal');
  });

  it('fetches savings goals successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ savingsGoalList: [{ savingsGoalUid: '200-201' }] }),
      text: async () => '',
    });
    const data = await api.getSavingsGoals('199-200');
    expect(data).toEqual({ savingsGoalList: [{ savingsGoalUid: '200-201' }] });
  });
});
