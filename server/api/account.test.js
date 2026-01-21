import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../server.js';

vi.mock('../services/starling.js', async () => {
  const actual = await vi.importActual('../services/starling.js');
  return {
    ...actual,
    getAccounts: vi.fn(),
  };
});

describe('Accounts API', () => {
  let getAccounts;

  beforeEach(async () => {
    ({ getAccounts } = await import('../services/starling.js'));
    vi.clearAllMocks();
  });

  it('should list accounts', async () => {
    getAccounts.mockResolvedValue([{ accountUid: '190-200', name: 'Main' }]);
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ accountUid: '190-200', name: 'Main' }]);
  });

  it('should return 500 if getAccounts throws', async () => {
    getAccounts.mockImplementation(() => {
      throw new Error('Failed to fetch accounts');
    });
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Failed to fetch accounts/);
  });
});
