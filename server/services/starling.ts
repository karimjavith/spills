import dotenv from 'dotenv';
import { log } from '../middleware/observability/logger.js';
import type {
  StarlingAccountsResponse,
  StarlingFeedResponse,
  StarlingSavingsGoalsResponse,
  StarlingCreateSavingsGoalResponse,
  StarlingTransferResponse,
  StarlingTokenResponse,
  StarlingAccount,
  StarlingFeedItem,
  StarlingSavingsGoal,
} from '../types/startling.type.js';
import {
  getErrorMessage,
  getStringField,
  isRecord,
  requiredENV,
  safeJson,
} from '../helpers/index.js';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

/**
 * Base URL for the Starling Bank API
 * @type {string}
 */
const API_BASE: string = requiredENV('STARLING_API_BASE');
/**
 * OAuth token endpoint URL for Starling Bank authentication
 * @type {string}
 */
const OAUTH_URL: string = requiredENV('STARLING_OAUTH_URL');
/**
 * Client ID for Starling Bank OAuth application
 * @type {string}
 */
const CLIENT_ID: string = requiredENV('STARLING_CLIENT_ID');
/**
 * Client secret for Starling Bank OAuth application
 * @type {string}
 */
const CLIENT_SECRET: string = requiredENV('STARLING_CLIENT_SECRET');
/**
 * Current access token for Starling Bank API authentication
 * Automatically refreshed when expired
 * @type {string}
 */
let accessToken: string | undefined = requiredENV('STARLING_ACCESS_TOKEN');
/**
 * Refresh token used to obtain new access tokens when they expire
 * @type {string}
 */
let refreshToken: string | undefined = requiredENV('STARLING_REFRESH_TOKEN');

/**
 * Refreshes the Starling Bank access token using the refresh token.
 * Updates the internal accessToken and refreshToken variables with new values.
 * This is necessary as the access token expires in 24hours
 *
 * @export
 * @async
 * @returns {Promise<string>} The new access token
 * @throws {Error} If the token refresh request fails
 */
export async function refreshAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken!,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const tokenData = await safeJson<StarlingTokenResponse>(res);
  if (!tokenData?.access_token) {
    log().error({ err: tokenData }, 'Invalid token response format');
    throw new Error('Invalid token response format');
  }
  log().info('starling_token_refresh_success');
  accessToken = tokenData.access_token as string;
  refreshToken = tokenData.refresh_token as string;
  return accessToken;
}

/**
 * Helper function to call Starling API with automatic token refresh on 401 errors.
 * If a request fails with a 401 status due to an expired token, this function
 * automatically refreshes the token and retries the request once.
 *
 * @async
 * @param {string} url - The API endpoint URL to fetch
 * @param {Object} [options={}] - Fetch options (method, headers, body, etc.)
 * @param {boolean} [retry=true] - Whether to retry the request after token refresh
 * @returns {Promise<Response>} The fetch response object
 */
async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'User-Agent': 'KarimSheikh',
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && retry) {
    // Try to parse error body
    let errorBody: unknown = {};
    try {
      errorBody = await safeJson(response);
    } catch (e: unknown) {
      log().error({ err: e }, 'Failed to parse 401 error body');
    }
    // Check if token expired
    if (
      (errorBody as Record<string, unknown>).error === 'invalid_token' &&
      (errorBody as Record<string, unknown>).error_description &&
      getStringField(errorBody, 'error_description')?.toLocaleLowerCase() ===
        'access token has expired'
    ) {
      log().warn(
        { status: response.status },
        'starling_token_expired_refreshing',
      );
      await refreshAccessToken();
      log().info('starling_request_retrying_with_new_token');
      // Retry original request with new token
      return fetchWithTokenRefresh(url, options, false);
    } else {
      throw new Error(
        `${getErrorMessage(errorBody) || 'Unauthorized: Invalid token'}`,
      );
    }
  }
  return response;
}

/**
 * Retrieves the list of accountInfos for the user.
 *
 * @export
 * @async
 * @returns {Promise<Array>} Array of account objects
 * @throws {Error} If the API request fails
 */
export async function getAccounts(): Promise<StarlingAccount[]> {
  const url = `${API_BASE}/accounts`;
  const response = await fetchWithTokenRefresh(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    log().error({ err: errorBody }, 'Failed to get accounts');
    throw new Error(
      `${getErrorMessage(errorBody) || 'Failed to get accounts'}`,
    );
  }

  const data = await safeJson<StarlingAccountsResponse>(response);
  if (!isRecord(data)) {
    throw new Error('Invalid response format from accounts endpoint');
  }
  const accounts = data.accounts as Array<unknown>;
  return Array.isArray(accounts) ? (accounts as StarlingAccount[]) : [];
}

/**
 * Fetches transactions for a specific category within a date range (7days).
 * Converts date parameters to ISO strings with full day coverage.
 *
 * @export
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} categoryUid - The unique identifier of the spending category
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of transaction feed items
 * @throws {Error} If the API request fails or returns an error
 */
export async function fetchTransactions(
  accountUid: string,
  categoryUid: string,
  from: string,
  to: string,
): Promise<StarlingFeedItem[]> {
  const fromToIsoString = from.toString() + 'T00:00:00.000Z';
  const toToIsoString = to.toString() + 'T23:59:59.999Z';

  const url = `${API_BASE}/feed/account/${accountUid}/category/${categoryUid}/transactions-between?minTransactionTimestamp=${fromToIsoString}&maxTransactionTimestamp=${toToIsoString}`;

  const response = await fetchWithTokenRefresh(url, { method: 'GET' });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    log().error({ err: errorBody }, 'Failed to fetch transactions');
    const errorMessage = getErrorMessage(errorBody) || 'Unknown error';

    throw new Error(`${errorMessage}`);
  }

  const data = await safeJson<StarlingFeedResponse>(response);
  if (!isRecord(data)) {
    throw new Error('Invalid response format from transactions endpoint');
  }
  const feedItems = data.feedItems as Array<unknown>;
  return Array.isArray(feedItems) ? (feedItems as StarlingFeedItem[]) : [];
}

/**
 * Retrieves all savings goals for a specific account.
 *
 * @export
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @returns {Promise<Array>} Array of savings goal objects
 * @throws {Error} If the API request fails
 */
export async function getSavingsGoals(
  accountUid: string,
): Promise<StarlingSavingsGoal[]> {
  const url = `${API_BASE}/account/${accountUid}/savings-goals`;

  const response = await fetchWithTokenRefresh(url, { method: 'GET' });

  if (!response.ok) {
    const errorBody = await safeJson<StarlingSavingsGoalsResponse>(response);
    log().error({ err: errorBody }, 'Failed to get savings goals');
    throw new Error(
      `${getErrorMessage(errorBody) || 'Failed to get savings goals'}`,
    );
  }

  const data = await safeJson<StarlingSavingsGoalsResponse>(response);
  if (!isRecord(data)) {
    throw new Error('Invalid response format from savings goals endpoint');
  }
  const savingsGoalList = data.savingsGoalList as Array<unknown>;
  return Array.isArray(savingsGoalList)
    ? (savingsGoalList as StarlingSavingsGoal[])
    : [];
}

/**
 * Creates a new savings goal for an account.
 *
 * @export
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} name - The name of the savings goal
 * @param {string} currency - The currency code (e.g., 'GBP', 'EUR')
 * @param {number} amount - The target amount in minor units (e.g., pence)
 * @returns {Promise<StarlingCreateSavingsGoalResponse>} The created savings goal object
 * @throws {Error} If the API request fails
 */
export async function createSavingsGoal(
  accountUid: string,
  name: string,
  currency: string,
  amount: number,
): Promise<StarlingCreateSavingsGoalResponse> {
  const url = `${API_BASE}/account/${accountUid}/savings-goals`;
  const body = {
    name,
    currency,
    target: { currency, minorUnits: amount }, // Optional: set a target amount
  };

  const response = await fetchWithTokenRefresh(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody =
      await safeJson<StarlingCreateSavingsGoalResponse>(response);
    log().error({ err: errorBody }, 'Failed to create savings goal');
    throw new Error(
      `${getErrorMessage(errorBody) || 'Failed to create savings goal'}`,
    );
  }

  return (await safeJson(response)) as StarlingCreateSavingsGoalResponse;
}

/**
 * Transfers money from the transactions list to a specific savings goal.
 * Uses a random UUID for idempotency to ensure the same transfer isn't made twice.
 *
 * @export
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} savingsGoalUid - The unique identifier of the savings goal
 * @param {number} amount - The amount to transfer (will be converted to minor units)
 * @param {string} currency - The currency code (e.g., 'GBP', 'EUR')
 * @returns {Promise<StarlingTransferResponse>} The transfer response object
 * @throws {Error} If the API request fails
 */
export async function transferToSavingsGoal(
  accountUid: string,
  savingsGoalUid: string,
  amount: number,
  currency: string,
): Promise<StarlingTransferResponse> {
  const url = `${API_BASE}/account/${accountUid}/savings-goals/${savingsGoalUid}/add-money/${crypto.randomUUID()}`;
  const body = {
    amount: {
      currency,
      minorUnits: Math.round(Number(amount) * 100), // amount in minor units (e.g., pence)
    },
  };

  const response = await fetchWithTokenRefresh(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await safeJson<StarlingTransferResponse>(response);
    log().error({ err: errorBody }, 'Failed to transfer to savings goal');
    throw new Error(
      `${getErrorMessage(errorBody) || 'Failed to transfer to savings goal'}`,
    );
  }

  return (await safeJson<StarlingTransferResponse>(response)) ?? {};
}
