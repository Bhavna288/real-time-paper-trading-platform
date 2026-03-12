import { useState, useEffect, useMemo } from 'react';
import { fetchStocks } from '../api/stocks';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { priceUpdates } = useSocket();

  const priceBySymbol = useMemo(() => {
    const map = {};
    priceUpdates.forEach((u) => { map[u.symbol] = u.currentPrice; });
    return map;
  }, [priceUpdates]);

  useEffect(() => {
    fetchStocks()
      .then(setStocks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-600">Loading stocks...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Stocks</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stocks.map((s) => (
              <tr key={s.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{s.symbol}</td>
                <td className="px-4 py-3 text-gray-600">{s.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">${Number(priceBySymbol[s.symbol] ?? s.currentPrice).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Link to={`/stocks/${s.symbol}`} className="text-sm text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
