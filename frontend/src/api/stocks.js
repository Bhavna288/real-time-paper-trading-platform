const BASE = '/api/stocks';

export async function fetchStocks() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch stocks');
  return res.json();
}

export async function fetchStockBySymbol(symbol) {
  const res = await fetch(`${BASE}/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('Failed to fetch stock');
  return res.json();
}
