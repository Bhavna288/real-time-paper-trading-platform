import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Loading orders...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Order History</h2>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-primary-100 bg-white p-4 text-slate-500">No orders yet. Place an order from a stock detail page.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Kind</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-600">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-600">Price / Trigger</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    <Link to={`/stocks/${o.symbol}`} className="text-primary-600 hover:text-primary-700">
                      {o.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{o.orderKind || 'MARKET'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={o.type === 'BUY' ? 'text-emerald-600' : 'text-red-600'}>
                      {o.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900">{o.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900">
                    {o.status === 'FILLED'
                      ? `$${Number(o.price).toFixed(2)}`
                      : o.orderKind === 'LIMIT' && o.limitPrice != null
                        ? `limit $${Number(o.limitPrice).toFixed(2)}`
                        : o.orderKind === 'STOP' && o.stopPrice != null
                          ? `stop $${Number(o.stopPrice).toFixed(2)}`
                          : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
