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
      text: async () => 'Error fetching accounts',
    });
    await expect(api.getAccounts()).rejects.toThrow('Error fetching accounts');
  });



  it('fetches list of transactions successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ feedItems: [{ feedItemUid: 'tx-1', amount: { minorUnits: 100, currency: 'GBP' } }] }),
      text: async () => '',
    });
    const data = await api.getTransactions('200-201', '199-200');
    expect(data).toEqual({ feedItems: [{ feedItemUid: 'tx-1', amount: { minorUnits: 100, currency: 'GBP' } }] });
  });

  it('returns error on transactions fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error fetching transactions',
    });
    await expect(
      api.getTransactions('200-201', '199-200'),
    ).rejects.toThrow('Error fetching transactions');
  });



  it('throws a parsed error for transactions', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ message: 'MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP' }] }),
      text: async () => '{"errors":[{"message":"MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP"}]}',
    });
    try {
      await api.getTransactions("199-200", "200-201", '2001-01-01 T23:23:00', '2000-07-01 T23:23:00');
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
      text: async () => 'Error creating savings goal',
    });
    await expect(
      api.createSavingsGoal('199-200', 'My Goal', 1000),
    ).rejects.toThrow('Error creating savings goal');
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
