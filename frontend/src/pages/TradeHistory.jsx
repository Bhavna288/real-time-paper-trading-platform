import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrades } from '../api/trades';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrades()
      .then(setTrades)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Loading trades...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Trade History</h2>
      {trades.length === 0 ? (
        <p className="rounded-xl border border-primary-100 bg-white p-4 text-slate-500">No trades yet. Place an order from a stock detail page.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">Side</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-600">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-600">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    <Link to={`/stocks/${t.symbol}`} className="text-primary-600 hover:text-primary-700">
                      {t.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={t.side === 'BUY' ? 'text-emerald-600' : 'text-red-600'}>
                      {t.side}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900">{t.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900">
                    ${Number(t.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
