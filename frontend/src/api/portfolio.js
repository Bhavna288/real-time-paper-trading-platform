const DEMO_USER_ID = 'demo-user-id';

export async function fetchPortfolio() {
  const res = await fetch(`/api/users/${DEMO_USER_ID}/portfolio`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}
