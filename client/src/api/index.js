const API_BASE = import.meta.env.VITE_STARLING_API_BASE; // This points to the backend proxy

export async function getAccounts() {
  const res = await fetch(`${API_BASE}/accounts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransactions(accountUid, categoryUid, from, to) {
  const url = new URL(`${API_BASE}/feed/account/${accountUid}/category/${categoryUid}/transactions-between`);
  url.searchParams.append('minTransactionTimestamp', from);
  url.searchParams.append('maxTransactionTimestamp', to);
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
