const DEMO_USER_ID = 'demo-user-id';

export async function fetchTrades() {
  const res = await fetch(`/api/users/${DEMO_USER_ID}/trades`);
  if (!res.ok) throw new Error('Failed to fetch trades');
  return res.json();
}
