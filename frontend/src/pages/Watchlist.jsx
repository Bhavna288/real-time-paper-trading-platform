import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlist';
import { useSocket } from '../context/SocketContext';

const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addSymbol, setAddSymbol] = useState('');
  const [addError, setAddError] = useState(null);
  const { priceUpdates } = useSocket();

  const priceBySymbol = useMemo(() => {
    return Object.fromEntries(priceUpdates.map((p) => [p.symbol, p.currentPrice]));
  }, [priceUpdates]);

  function loadWatchlist() {
    setLoading(true);
    fetchWatchlist()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const sym = addSymbol.toUpperCase().trim();
    if (!sym) return;
    setAddError(null);
    try {
      await addToWatchlist(sym);
      setAddSymbol('');
      loadWatchlist();
    } catch (err) {
      setAddError(err.message);
    }
  }

  async function handleRemove(symbol) {
    try {
      await removeFromWatchlist(symbol);
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && items.length === 0) return <p className="p-6 text-gray-600">Loading watchlist...</p>;
  if (error && items.length === 0) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Watchlist</h2>

      <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="add-symbol" className="mb-1 block text-sm text-gray-600">Add symbol</label>
          <select
            id="add-symbol"
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {SYMBOLS.filter((s) => !items.some((i) => i.symbol === s)).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!addSymbol}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
        {addError && <p className="text-sm text-red-600">{addError}</p>}
      </form>

      {items.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No symbols in watchlist. Add one above.</p>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between rounded-t border border-b-0 border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
            <span>Symbol</span>
            <span>Price</span>
            <span className="w-14" aria-hidden />
          </div>
          <ul className="space-y-2">
          {items.map((item) => {
            const price = priceBySymbol[item.symbol] ?? item.currentPrice;
            return (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <Link to={`/stocks/${item.symbol}`} className="font-medium text-blue-600 hover:underline">
                  {item.symbol}
                </Link>
                <span className="text-gray-700 tabular-nums">
                  {price != null ? `$${Number(price).toFixed(2)}` : '—'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.symbol)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            );
          })}
          </ul>
        </>
      )}
    </div>
  );
}
