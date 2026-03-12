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

  if (loading) return <p className="p-6 text-gray-600">Loading trades...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Trade History</h2>
      {trades.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No trades yet. Place an order from a stock detail page.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Side</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trades.map((t) => (
                <tr key={t.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    <Link to={`/stocks/${t.symbol}`} className="text-blue-600 hover:underline">
                      {t.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={t.side === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                      {t.side}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">{t.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
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
