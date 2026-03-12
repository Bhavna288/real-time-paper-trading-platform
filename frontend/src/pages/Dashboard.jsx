import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchStocks } from '../api/stocks';
import { fetchBalance } from '../api/portfolio';
import { fetchHoldings } from '../api/holdings';
import { fetchWatchlist } from '../api/watchlist';
import { fetchTrades } from '../api/trades';
import { useSocket } from '../context/SocketContext';

const RECENT_TRADES = 5;
const WATCHLIST_PREVIEW = 5;

function formatDate(d) {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [balance, setBalance] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { priceUpdates } = useSocket();

  const priceBySymbol = useMemo(() => {
    const map = {};
    priceUpdates.forEach((u) => { map[u.symbol] = u.currentPrice; });
    return map;
  }, [priceUpdates]);

  useEffect(() => {
    Promise.all([
      fetchStocks(),
      fetchBalance(),
      fetchHoldings(),
      fetchWatchlist(),
      fetchTrades(),
    ])
      .then(([stocksData, bal, h, wl, t]) => {
        setStocks(stocksData);
        setBalance(bal);
        setHoldings(h);
        setWatchlist(wl);
        setTrades(Array.isArray(t) ? t.slice(0, RECENT_TRADES) : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { totalHoldingsValue, totalPortfolioValue, unrealizedPnl } = useMemo(() => {
    if (!balance || !holdings.length) {
      return {
        totalHoldingsValue: 0,
        totalPortfolioValue: balance ? balance.cashBalance : 0,
        unrealizedPnl: 0,
      };
    }
    const cash = balance.cashBalance;
    let totalHoldings = 0;
    let pnl = 0;
    holdings.forEach((h) => {
      const price = priceBySymbol[h.symbol] ?? h.currentPrice;
      const marketValue = h.quantity * price;
      totalHoldings += marketValue;
      pnl += marketValue - h.quantity * h.averagePrice;
    });
    return {
      totalHoldingsValue: totalHoldings,
      totalPortfolioValue: cash + totalHoldings,
      unrealizedPnl: pnl,
    };
  }, [balance, holdings, priceBySymbol]);

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  const watchlistPreview = watchlist.slice(0, WATCHLIST_PREVIEW);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Dashboard</h2>

      {/* Portfolio at a glance → full detail on Portfolio page */}
      {balance && (
        <div className="mb-6">
          <Link
            to="/portfolio"
            className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <span className="text-sm text-gray-500">Portfolio</span>
            <span className="text-lg font-semibold text-gray-900">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} total
            </span>
            <span className={`text-sm font-medium ${unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl >= 0 ? '' : '-'}${Math.abs(unrealizedPnl).toFixed(2)} unrealized P&amp;L
            </span>
            <span className="ml-auto text-sm text-blue-600">View details →</span>
          </Link>
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Watchlist preview */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">Watchlist</h3>
            <Link to="/watchlist" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {watchlistPreview.length === 0 ? (
            <p className="text-sm text-gray-500">No symbols in watchlist.</p>
          ) : (
            <ul className="space-y-2">
              {watchlistPreview.map((item) => {
                const price = priceBySymbol[item.symbol] ?? item.currentPrice;
                return (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <Link to={`/stocks/${item.symbol}`} className="font-medium text-blue-600 hover:underline">
                      {item.symbol}
                    </Link>
                    <span className="tabular-nums text-gray-700">
                      {price != null ? `$${Number(price).toFixed(2)}` : '—'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent trades */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">Recent trades</h3>
            <Link to="/trades" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {trades.length === 0 ? (
            <p className="text-sm text-gray-500">No trades yet.</p>
          ) : (
            <ul className="space-y-2">
              {trades.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className={t.side === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                      {t.side}
                    </span>
                    {' '}
                    <Link to={`/stocks/${t.symbol}`} className="font-medium text-blue-600 hover:underline">
                      {t.symbol}
                    </Link>
                    {' '}
                    {t.quantity} @ ${Number(t.price).toFixed(2)}
                  </span>
                  <span className="text-gray-500">{formatDate(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Market / stocks table */}
      <h3 className="mb-3 text-sm font-medium text-gray-800">Market</h3>
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
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-900">
                  ${Number(priceBySymbol[s.symbol] ?? s.currentPrice).toFixed(2)}
                </td>
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
