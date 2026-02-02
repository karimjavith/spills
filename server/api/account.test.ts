import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../app.js';

// mock the whole services module
import * as starling from '../services/starling.js';
vi.mock('../services/starling.js', () => ({
  getAccounts: vi.fn(),
}));

const getAccountsMock = vi.mocked(starling.getAccounts);

describe('Accounts API', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should list accounts', async () => {
    getAccountsMock.mockResolvedValue([
      {
        accountUid: '190-200',
        name: 'Main',
        accountType: 'PERSONAL',
        defaultCategory: '190-200-300',
        currency: 'GBP',
      },
    ]);
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: '190-200',
        name: 'Main',
        type: 'PERSONAL',
        categoryId: '190-200-300',
      },
    ]);
  });

  it('should return 500 if getAccounts throws', async () => {
    getAccountsMock.mockImplementation(() => {
      throw new Error('Failed to fetch accounts');
    });
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Failed to fetch accounts/);
  });
});
