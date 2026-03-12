import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStockBySymbol } from '../api/stocks';
import OrderForm from '../components/OrderForm';
import LivePriceChart from '../components/LivePriceChart';
import { useSocket } from '../context/SocketContext';

const MAX_CHART_POINTS = 60;

export default function StockDetail() {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const { priceUpdates } = useSocket();

  const livePrice = useMemo(() => {
    const u = priceUpdates.find((p) => p.symbol === symbol?.toUpperCase());
    return u ? u.currentPrice : null;
  }, [priceUpdates, symbol]);

  useEffect(() => {
    if (!symbol) return;
    fetchStockBySymbol(symbol)
      .then(setStock)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  const displayPrice = stock ? (livePrice ?? stock.currentPrice) : null;

  useEffect(() => {
    if (displayPrice == null) return;
    setPriceHistory((prev) => {
      const next = [...prev.slice(-(MAX_CHART_POINTS - 1)), { time: Date.now(), price: displayPrice }];
      return next;
    });
  }, [displayPrice]);

  useEffect(() => {
    setPriceHistory([]);
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
          ${Number(displayPrice).toFixed(2)}
        </p>
      </div>
      <LivePriceChart data={priceHistory} />
      <div className="mt-6 max-w-sm">
        <OrderForm
          symbol={stock.symbol}
          currentPrice={displayPrice}
        />
      </div>
    </div>
  );
}
