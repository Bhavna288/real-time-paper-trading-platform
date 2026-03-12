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

  if (loading) return <p className="p-6 text-gray-600">Loading orders...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Order History</h2>
      {orders.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No orders yet. Place an order from a stock detail page.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    <Link to={`/stocks/${o.symbol}`} className="text-blue-600 hover:underline">
                      {o.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={o.type === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                      {o.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">{o.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                    ${Number(o.price).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
