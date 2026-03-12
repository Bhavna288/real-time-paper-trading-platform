const DEMO_USER_ID = 'demo-user-id';
const BASE = `/api/users/${DEMO_USER_ID}/watchlist`;

export async function fetchWatchlist() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return res.json();
}

export async function addToWatchlist(symbol) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: symbol.toUpperCase() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add to watchlist');
  return data;
}

export async function removeFromWatchlist(symbol) {
  const res = await fetch(`${BASE}/${encodeURIComponent(symbol.toUpperCase())}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove from watchlist');
  return data;
}
