const DEMO_USER_ID = 'demo-user-id';

export async function fetchOrders() {
  const res = await fetch(`/api/users/${DEMO_USER_ID}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function placeOrder(symbol, type, quantity, orderKind = 'MARKET', limitPrice, stopPrice) {
  const body = {
    userId: DEMO_USER_ID,
    symbol,
    type: type.toUpperCase(),
    quantity: Number(quantity),
    orderKind: (orderKind || 'MARKET').toUpperCase(),
  };
  if (body.orderKind === 'LIMIT' && limitPrice != null) body.limitPrice = Number(limitPrice);
  if (body.orderKind === 'STOP' && stopPrice != null) body.stopPrice = Number(stopPrice);

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data;
}
