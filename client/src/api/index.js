/**
 * Base URL for the local backend server which connects to Starling Sandbox API
 *
 * @type {string}
 */
const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Fetches the list of accounts from the local backend server.
 *
 * @async
 * @returns {Promise<Object>} Promise resolving to the accounts data
 * @throws {Error} If the API request fails
 */
export async function getAccounts() {
  const response = await fetch(`${API_BASE}/api/accounts`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch accounts");
  }
  return await response.json();
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
  const params = new URLSearchParams({
    accountUid,
    categoryUid,
    from: new Date(from).toISOString().split("T")[0],
    to: new Date(to).toISOString().split("T")[0],
  });

  const url = new URL(`${API_BASE}/api/transactions?${params.toString()}`);
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
  const params = new URLSearchParams({ accountUid });
  const response = await fetch(
    `${API_BASE}/api/savings/goals?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch savings goals");
  }
  return await response.json();
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
export async function createSavingsGoal(
  accountUid,
  name,
  currency,
  amountMinorUnits,
) {
  const response = await fetch(`${API_BASE}/api/savings/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      accountUid,
      name,
      currency,
      amount: amountMinorUnits,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create savings goal");
  }
  return await response.json();
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
export async function transferToSavingsGoal(
  accountUid,
  savingsGoalUid,
  amount,
  currency,
) {
  const res = await fetch(`${API_BASE}/api/savings/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      accountUid,
      savingsGoalUid,
      amount,
      currency,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
