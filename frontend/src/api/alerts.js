const DEMO_USER_ID = 'demo-user-id';
const BASE = `/api/users/${DEMO_USER_ID}/alerts`;

export async function fetchAlerts() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function createAlert(symbol, direction, targetPrice) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: symbol.toUpperCase(),
      direction: direction.toUpperCase(),
      targetPrice: Number(targetPrice),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create alert');
  return data;
}

export async function deleteAlert(alertId) {
  const res = await fetch(`${BASE}/${encodeURIComponent(alertId)}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete alert');
  return data;
}
