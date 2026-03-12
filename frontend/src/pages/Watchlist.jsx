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

  if (loading && items.length === 0) return <p className="p-6 text-slate-600">Loading watchlist...</p>;
  if (error && items.length === 0) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Watchlist</h2>

      <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="add-symbol" className="mb-1 block text-sm text-slate-600">Add symbol</label>
          <select
            id="add-symbol"
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
          className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Add
        </button>
        {addError && <p className="text-sm text-red-600">{addError}</p>}
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-primary-100 bg-white p-4 text-slate-500">No symbols in watchlist. Add one above.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-primary-50 px-4 py-2 text-sm font-medium text-slate-600">
            <span>Symbol</span>
            <span>Price</span>
            <span className="w-14" aria-hidden />
          </div>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const price = priceBySymbol[item.symbol] ?? item.currentPrice;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50"
                >
                  <Link to={`/stocks/${item.symbol}`} className="font-medium text-primary-600 hover:text-primary-700">
                    {item.symbol}
                  </Link>
                  <span className="tabular-nums text-slate-700">
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
        </div>
      )}
    </div>
  );
}
