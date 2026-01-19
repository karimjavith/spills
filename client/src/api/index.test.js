import { describe, it, expect, vi } from 'vitest';
import * as api from './index';

global.fetch = vi.fn();

describe('API client', () => {
  it('returns accounts on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [{ id: '1' }] }),
      text: async () => '',
    });
    const data = await api.getAccounts();
    expect(data).toEqual({ accounts: [{ id: '1' }] });
  });

  it('returns error on account fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error fetching accounts',
    });
    await expect(api.getAccounts()).rejects.toThrow('Error fetching accounts');
  });
});
