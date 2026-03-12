const DEMO_USER_ID = 'demo-user-id';

export async function fetchHoldings() {
  const res = await fetch(`/api/users/${DEMO_USER_ID}/holdings`);
  if (!res.ok) throw new Error('Failed to fetch holdings');
  return res.json();
}
