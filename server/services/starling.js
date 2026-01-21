import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

/**
 * Base URL for the Starling Bank API
 * @type {string}
 */
const API_BASE = process.env.STARLING_API_BASE;
/**
 * OAuth token endpoint URL for Starling Bank authentication
 * @type {string}
 */
const OAUTH_URL = process.env.STARLING_OAUTH_URL;
/**
 * Client ID for Starling Bank OAuth application
 * @type {string}
 */
const CLIENT_ID = process.env.STARLING_CLIENT_ID;
/**
 * Client secret for Starling Bank OAuth application
 * @type {string}
 */
const CLIENT_SECRET = process.env.STARLING_CLIENT_SECRET;
/**
 * Current access token for Starling Bank API authentication
 * Automatically refreshed when expired
 * @type {string}
 */
let accessToken = process.env.STARLING_ACCESS_TOKEN;
/**
 * Refresh token used to obtain new access tokens when they expire
 * @type {string}
 */
let refreshToken = process.env.STARLING_REFRESH_TOKEN;

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
export async function refreshAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await res.json();
  if (!res.ok) throw new Error('Failed to refresh token');
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
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
async function fetchWithTokenRefresh(url, options = {}, retry = true) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'User-Agent': 'KarimSheikh',
  };
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    // Try to parse error body
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch {}
    // Check if token expired
    if (
      errorBody.error === 'invalid_token' &&
      errorBody.error_description &&
      errorBody.error_description.toLowerCase() === 'access token has expired'
    ) {
      await refreshAccessToken();
      // Retry original request with new token
      return fetchWithTokenRefresh(url, options, false);
    }
  }
  return response;
}

/**
 * Retrieves the list of accountInfos for the user.
 *
 * @export
 * @async
 * @param {string} token - Access token (parameter not used, uses internal token)
 * @returns {Promise<Array>} Array of account objects
 * @throws {Error} If the API request fails
 */
export async function getAccounts(token) {
  const url = `${API_BASE}/accounts`;
  const response = await fetchWithTokenRefresh(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`${errorBody?.message || 'Failed to get accounts'}`);
  }

  const data = await response.json();
  return data.accounts || [];
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
export async function fetchTransactions(accountUid, categoryUid, from, to) {
  const fromToIsoString = from.toString() + 'T00:00:00.000Z';
  const toToIsoString = to.toString() + 'T23:59:59.999Z';

  const url = `${API_BASE}/feed/account/${accountUid}/category/${categoryUid}/transactions-between?minTransactionTimestamp=${fromToIsoString}&maxTransactionTimestamp=${toToIsoString}`;

  const response = await fetchWithTokenRefresh(url, { method: 'GET' });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMessage =
      errorBody.errors[0]?.message || errorBody?.message || 'Unknown error';

    throw new Error(`${errorMessage}`);
  }

  const data = await response.json();
  return data.feedItems || [];
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
export async function getSavingsGoals(accountUid) {
  const url = `${API_BASE}/account/${accountUid}/savings-goals`;

  const response = await fetchWithTokenRefresh(url, { method: 'GET' });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`${errorBody?.message || 'Failed to get savings goals'}`);
  }

  const data = await response.json();
  return data.savingsGoalList || [];
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
 * @returns {Promise<Object>} The created savings goal object
 * @throws {Error} If the API request fails
 */
export async function createSavingsGoal(accountUid, name, currency, amount) {
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
    const errorBody = await response.text();
    throw new Error(`${errorBody?.message || 'Failed to create savings goal'}`);
  }

  return await response.json();
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
 * @returns {Promise<Object>} The transfer response object
 * @throws {Error} If the API request fails
 */
export async function transferToSavingsGoal(
  accountUid,
  savingsGoalUid,
  amount,
  currency,
) {
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
    const errorBody = await response.json();
    throw new Error(
      `${errorBody?.message || 'Failed to transfer to savings goal'}`,
    );
  }

  return await response.json();
}
