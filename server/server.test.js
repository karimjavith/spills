import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from './server.js';

// Mock node-fetch globally
import fetch from 'node-fetch';
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

const mockAccessToken = 'mock-access-token';
const mockRefreshToken = 'mock-refresh-token';
const mockNewAccessToken = 'mock-new-access-token';

beforeEach(() => {
  process.env.STARLING_API_BASE = 'https://api-sandbox.starlingbank.com/api/v2';
  process.env.STARLING_OAUTH_URL = 'https://oauth-sandbox.starlingbank.com/token';
  process.env.STARLING_CLIENT_ID = 'clientid';
  process.env.STARLING_CLIENT_SECRET = 'clientsecret';
  process.env.STARLING_ACCESS_TOKEN = mockAccessToken;
  process.env.STARLING_REFRESH_TOKEN = mockRefreshToken;
  fetch.mockReset();
});

describe('Starling Proxy', () => {
  it('proxies GET request successfully', async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ accounts: [{ id: '1' }] }),
      text: async () => '',
      ok: true,
    });

    const res = await request(app).get('/api/starling/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accounts: [{ id: '1' }] });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accounts'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${mockAccessToken}` }),
      })
    );
  });

  it('refreshes token on 401 with expired token error and retries', async () => {
    // First call returns 401 with "expired" error
    fetch
      .mockResolvedValueOnce({
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({
          error: 'invalid_token',
          error_description: 'Access token expired'
        }),
        text: async () => '',
        ok: false,
      })
      // Refresh token call
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: mockNewAccessToken,
          refresh_token: 'new-refresh-token',
        }),
        headers: { get: () => 'application/json' },
        status: 200,
        text: async () => '',
      })
      // Retry original call with new token
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ accounts: [{ id: '2' }] }),
        text: async () => '',
        ok: true,
      });

    const res = await request(app).get('/api/starling/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accounts: [{ id: '2' }] });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[1][0]).toBe(process.env.STARLING_OAUTH_URL);
    expect(fetch.mock.calls[2][1].headers.Authorization).toBe(`Bearer ${mockNewAccessToken}`);
  });

  it('does NOT refresh token on 401 with invalid token error', async () => {
    // First call returns 401 with "invalid" error (not expired)
    fetch.mockResolvedValueOnce({
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({
        error: 'invalid_token',
        error_description: 'Access token is invalid'
      }),
      text: async () => '',
      ok: false,
    });

    const res = await request(app).get('/api/starling/accounts');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'invalid_token',
      error_description: 'Access token is invalid'
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('returns error if refresh fails', async () => {
    // First call returns 401 with "expired" error
    fetch
      .mockResolvedValueOnce({
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({
          error: 'invalid_token',
          error_description: 'Access token expired'
        }),
        text: async () => '',
        ok: false,
      })
      // Refresh token call fails
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
        text: async () => 'invalid_grant',
        headers: { get: () => 'application/json' },
      });

    const res = await request(app).get('/api/starling/accounts');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Failed to refresh token');
  });

  it('handles Starling API failure', async () => {
    fetch.mockResolvedValueOnce({
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Internal Server Error' }),
      text: async () => '',
      ok: false,
    });

    const res = await request(app).get('/api/starling/accounts');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('handles invalid endpoint', async () => {
    fetch.mockResolvedValueOnce({
      status: 404,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Not Found' }),
      text: async () => '',
      ok: false,
    });

    const res = await request(app).get('/api/starling/invalid-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });
});
