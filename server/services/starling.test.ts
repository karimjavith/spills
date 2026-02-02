import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSavingsGoal,
  getAccounts,
  getSavingsGoals,
  transferToSavingsGoal,
} from './starling.js';
import { jsonResponse } from '../helpers/index.js';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

describe('getAccounts', () => {
  beforeEach(() => fetchMock.mockReset());

  it('should return accounts list', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          accounts: [{ accountUid: '190-200', name: 'Joe Doe' }],
        },
        200,
      ),
    );
    const result = await getAccounts();
    expect(result).toEqual([{ accountUid: '190-200', name: 'Joe Doe' }]);
  });

  it('should throw on Starling API error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'error' }, 500));
    await expect(getAccounts()).rejects.toThrow(/Failed to get accounts/);
  });
});

describe('getSavingsGoals', () => {
  beforeEach(() => fetchMock.mockReset());

  it('should return savings goals list', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          savingsGoalList: [{ name: 'Holiday' }],
        },
        200,
      ),
    );
    const result = await getSavingsGoals('190-200');
    expect(result).toEqual([{ name: 'Holiday' }]);
  });

  it('should throw on Starling API error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'error' }, 500));
    await expect(getSavingsGoals('190-200')).rejects.toThrow(
      /Failed to get savings goals/,
    );
  });
});

describe('createSavingsGoal', () => {
  beforeEach(() => fetchMock.mockReset());

  it('should create a savings goal', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          savingsGoalUid: 'goal1',
        },
        200,
      ),
    );
    const result = await createSavingsGoal('190-200', 'adventure', 'GBP', 101);
    expect(result).toEqual({ savingsGoalUid: 'goal1' });
  });

  it('should throw on Starling API error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'error' }, 500));
    await expect(
      createSavingsGoal('190-200', 'adventure', 'GBP', 101),
    ).rejects.toThrow(/Failed to create savings goal/);
  });
});

describe('transferToSavingsGoal', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('should call Starling API and return response', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          success: true,
        },
        200,
      ),
    );

    const result = await transferToSavingsGoal(
      '190-200',
      '190-200-201',
      158,
      'GBP',
    );
    expect(fetchMock).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should throw on Starling API error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'error' }, 500));

    await expect(
      transferToSavingsGoal('190-200', '190-200-201', 158, 'GBP'),
    ).rejects.toThrow(/Failed to transfer to savings goal/);
  });
});
