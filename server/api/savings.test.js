import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from '../server.js';

vi.mock('../services/starling.js', async () => {
  const actual = await vi.importActual('../services/starling.js');
  return {
    ...actual,
    transferToSavingsGoal: vi.fn(),
    getSavingsGoals: vi.fn(),
    createSavingsGoal: vi.fn(),
  };
});

describe('Savings Goals API', () => {
  let getSavingsGoals, createSavingsGoal;

  beforeEach(async () => {
    ({ getSavingsGoals, createSavingsGoal } =
      await import('../services/starling.js'));
    vi.clearAllMocks();
  });

  it('should list savings goals', async () => {
    getSavingsGoals.mockResolvedValue([{ name: 'Holiday' }]);
    const res = await request(app)
      .get('/api/savings/goals')
      .query({ accountUid: '190-200' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Holiday' }]);
  });

  it('should return 400 if accountUid missing', async () => {
    const res = await request(app).get('/api/savings/goals');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it.skip('should create a savings goal', async () => {
    createSavingsGoal.mockResolvedValue({ savingsGoalUid: 'goal1' });
    const res = await request(app)
      .post('/api/savings/goals')
      .send({
        accountUid: '190-200',
        name: 'Holiday',
        currency: 'GBP',
        amount: 1000,
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ savingsGoalUid: 'goal1' });
  });

  it.skip('should return 400 if params missing for create', async () => {
    const res = await request(app).post('/api/savings/goals').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it.skip('should return 500 if getSavingsGoals throws', async () => {
    getSavingsGoals.mockImplementation(() => {
      throw new Error('fail');
    });
    const res = await request(app)
      .get('/api/savings/goals')
      .query({ accountUid: '190-200' });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/fail/);
  });

  it.skip('should return 500 if createSavingsGoal throws', async () => {
    createSavingsGoal.mockImplementation(() => {
      throw new Error('fail');
    });
    const res = await request(app)
      .post('/api/savings/goals')
      .send({ accountUid: '190-200', name: 'Holiday', currency: 'GBP' });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/fail/);
  });
});

describe('POST /api/savings/transfer', () => {
  let transferToSavingsGoal;

  beforeEach(async () => {
    ({ transferToSavingsGoal } = await import('../services/starling.js'));
    vi.clearAllMocks();
  });

  it('should transfer to savings goal and return result', async () => {
    transferToSavingsGoal.mockResolvedValue({ success: true });

    const res = await request(app).post('/api/savings/transfer').send({
      accountUid: '190-200',
      savingsGoalUid: '190-200-201',
      amount: 158,
      currency: 'GBP',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('should return 400 for missing params', async () => {
    const res = await request(app).post('/api/savings/transfer').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 500 if transferToSavingsGoal throws', async () => {
    transferToSavingsGoal.mockImplementation(() => {
      throw new Error('Starling API failure');
    });

    const res = await request(app).post('/api/savings/transfer').send({
      accountUid: '190-200',
      savingsGoalUid: '190-200-201',
      amount: 158,
      currency: 'GBP',
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Starling API failure/);
  });
});
