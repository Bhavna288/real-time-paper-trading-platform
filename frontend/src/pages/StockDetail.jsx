import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStockBySymbol, fetchPriceHistory } from '../api/stocks';
import OrderForm from '../components/OrderForm';
import LivePriceChart from '../components/LivePriceChart';
import { useSocket } from '../context/SocketContext';

const MAX_CHART_POINTS = 60;
const CHART_RANGES = [
  { value: 'live', label: 'Live' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '3m', label: '3M' },
];

export default function StockDetail() {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [chartRange, setChartRange] = useState('live');
  const [historicalData, setHistoricalData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
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

  useEffect(() => {
    if (!symbol || chartRange === 'live') {
      setHistoricalData([]);
      return;
    }
    setHistoryLoading(true);
    fetchPriceHistory(symbol, chartRange)
      .then(setHistoricalData)
      .catch(() => setHistoricalData([]))
      .finally(() => setHistoryLoading(false));
  }, [symbol, chartRange]);

  const chartData = chartRange === 'live' ? priceHistory : historicalData;
  const chartTitle = chartRange === 'live' ? 'Live price' : CHART_RANGES.find((r) => r.value === chartRange)?.label ?? 'Price';

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
      <div className="mt-4 flex gap-2">
        {CHART_RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setChartRange(r.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              chartRange === r.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {chartRange === 'live' ? (
        <LivePriceChart data={chartData} title={chartTitle} />
      ) : historyLoading ? (
        <p className="mt-4 text-gray-500">Loading chart...</p>
      ) : chartData.length === 0 ? (
        <p className="mt-4 text-gray-500">No historical data for this range.</p>
      ) : (
        <LivePriceChart data={chartData} title={chartTitle} />
      )}
      <div className="mt-6 max-w-sm">
        <OrderForm
          symbol={stock.symbol}
          currentPrice={displayPrice}
        />
      </div>
    </div>
  );
}
