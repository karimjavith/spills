/**
 * Base URL for the Starling Bank API, pointing to the backend proxy server.
 *
 * @type {string}
 */
const API_BASE = import.meta.env.VITE_STARLING_API_BASE; // This points to the backend proxy

/**
 * Fetches the list of accounts from the Starling API.
 *
 * @async
 * @returns {Promise<Object>} Promise resolving to the accounts data
 * @throws {Error} If the API request fails
 */
export async function getAccounts() {
  const res = await fetch(`${API_BASE}/accounts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Fetches transactions for a specific account and category within a date range.
 *
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} categoryUid - The unique identifier of the transaction category
 * @param {string} from - The start date in ISO format
 * @param {string} to - The end date in ISO format
 * @returns {Promise<Object>} Promise resolving to the transactions data
 * @throws {Error} If the API request fails
 */
export async function getTransactions(accountUid, categoryUid, from, to) {
  const url = new URL(`${API_BASE}/feed/account/${accountUid}/category/${categoryUid}/transactions-between`);
  url.searchParams.append('minTransactionTimestamp', from);
  url.searchParams.append('maxTransactionTimestamp', to);
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Fetches the list of savings goals for a specific account.
 *
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @returns {Promise<Object>} Promise resolving to the savings goals data
 * @throws {Error} If the API request fails
 */
export async function getSavingsGoals(accountUid) {
  const res = await fetch(`${API_BASE}/account/${accountUid}/savings-goals`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Creates a new savings goal for a specific account.
 *
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} name - The name of the savings goal
 * @param {number} amountMinorUnits - The target amount in minor units (e.g., pence)
 * @returns {Promise<Object>} Promise resolving to the created savings goal data
 * @throws {Error} If the API request fails
 */
export async function createSavingsGoal(accountUid, name, amountMinorUnits) {
  const body = {
    name,
    currency: "GBP",
    target: { currency: "GBP", minorUnits: amountMinorUnits }
  };
  const res = await fetch(`${API_BASE}/account/${accountUid}/savings-goals`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Transfers money to a specific savings goal.
 *
 * @async
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} savingsGoalUid - The unique identifier of the savings goal
 * @param {number} amountMinorUnits - The amount to transfer in minor units
 * @returns {Promise<Object>} Promise resolving to the transfer result data
 * @throws {Error} If the API request fails
 */
export async function transferToSavingsGoal(accountUid, savingsGoalUid, amountMinorUnits) {
  const transferUid = crypto.randomUUID();
  const body = {
    amount: { currency: "GBP", minorUnits: amountMinorUnits }
  };
  const res = await fetch(`${API_BASE}/account/${accountUid}/savings-goals/${savingsGoalUid}/add-money/${transferUid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
