import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from './app.js';
import request from 'supertest';
import { jsonResponse } from './helpers/index.js';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;
const mockAccessToken = 'mock-access-token';
const mockRefreshToken = 'mock-refresh-token';
const mockNewAccessToken = 'mock-new-access-token';

beforeEach(() => {
  process.env.STARLING_API_BASE = 'https://api-sandbox.starlingbank.com/api/v2';
  process.env.STARLING_OAUTH_URL =
    'https://oauth-sandbox.starlingbank.com/token';
  process.env.STARLING_CLIENT_ID = 'clientid';
  process.env.STARLING_CLIENT_SECRET = 'clientsecret';
  process.env.STARLING_ACCESS_TOKEN = mockAccessToken;
  process.env.STARLING_REFRESH_TOKEN = mockRefreshToken;
  fetchMock.mockReset();
});

describe('Starling Proxy', () => {
  it('proxies GET request successfully', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          accounts: [
            {
              accountUid: '1',
              name: 'Unnamed Account',
              accountType: 'PERSONAL',
            },
          ],
        },
        200,
      ),
    );

    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: '1', name: 'Unnamed Account', type: 'PERSONAL' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockAccessToken}`,
        }),
      }),
    );
  });

  it('refreshes token on 401 with expired token error and retries', async () => {
    // First call returns 401 with "expired" error
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: 'invalid_token',
            error_description: 'Access token has expired',
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            access_token: mockNewAccessToken,
            refresh_token: 'new-refresh-token',
          },
          200,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            accounts: [
              {
                accountUid: '2',
                name: 'Unnamed Account',
                accountType: 'PERSONAL',
              },
            ],
          },
          200,
        ),
      );

    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: '2', name: 'Unnamed Account', type: 'PERSONAL' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(process.env.STARLING_OAUTH_URL);
    const init = fetchMock.mock.calls[2]?.[1] as RequestInit | undefined;
    expect(init).toBeTruthy();

    expect(init!.headers).toEqual(
      expect.objectContaining({
        Authorization: `Bearer ${mockNewAccessToken}`,
      }),
    );
  });

  it('handles Starling API failure', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'error' }, 500));

    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('handles invalid endpoint', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Not Found' }, 404));

    const res = await request(app).get('/api/invalid-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });
});
