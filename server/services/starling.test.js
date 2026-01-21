import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSavingsGoal,
  getAccounts,
  getSavingsGoals,
  transferToSavingsGoal,
} from './starling.js';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';

describe('getAccounts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return accounts list', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accounts: [{ accountUid: '190-200', name: 'Joe Doe' }],
      }),
    });
    const result = await getAccounts('token');
    expect(result).toEqual([{ accountUid: '190-200', name: 'Joe Doe' }]);
  });

  it('should throw on Starling API error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'error',
    });
    await expect(getAccounts()).rejects.toThrow(/Failed to get accounts/);
  });
});

describe('getSavingsGoals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return savings goals list', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ savingsGoalList: [{ name: 'Holiday' }] }),
    });
    const result = await getSavingsGoals('190-200');
    expect(result).toEqual([{ name: 'Holiday' }]);
  });

  it('should throw on Starling API error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'error',
    });
    await expect(getSavingsGoals('190-200')).rejects.toThrow(
      /Failed to get savings goals/,
    );
  });
});

describe('createSavingsGoal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a savings goal', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ savingsGoalUid: 'goal1' }),
    });
    const result = await createSavingsGoal('190-200', 'Holiday', 'GBP');
    expect(result).toEqual({ savingsGoalUid: 'goal1' });
  });

  it('should throw on Starling API error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'error',
    });
    await expect(
      createSavingsGoal('190-200', 'Holiday', 'GBP'),
    ).rejects.toThrow(/Failed to create savings goal/);
  });
});

describe('transferToSavingsGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Starling API and return response', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await transferToSavingsGoal(
      '190-200',
      '190-200-201',
      158,
      'GBP',
      'token',
    );
    expect(fetch).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should throw on Starling API error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => 'error',
    });

    await expect(
      transferToSavingsGoal('190-200', '190-200-201', 158, 'GBP', 'token'),
    ).rejects.toThrow(/Failed to transfer to savings goal/);
  });
});
