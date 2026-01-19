const API_BASE = import.meta.env.VITE_STARLING_API_BASE; // This points to the backend proxy

export async function getAccounts() {
  const res = await fetch(`${API_BASE}/accounts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
