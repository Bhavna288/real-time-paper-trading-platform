import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStockBySymbol } from '../api/stocks';

export default function StockDetail() {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    fetchStockBySymbol(symbol)
      .then(setStock)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!stock) return null;

  return (
    <div className="p-6">
      <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">{stock.symbol}</h2>
        <p className="mt-1 text-gray-600">{stock.name}</p>
        <p className="mt-4 text-3xl font-bold text-gray-900">
          ${Number(stock.currentPrice).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
