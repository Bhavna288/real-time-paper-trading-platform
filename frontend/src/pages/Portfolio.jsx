import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBalance } from '../api/portfolio';
import { fetchHoldings } from '../api/holdings';

export default function Portfolio() {
  const [balance, setBalance] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchBalance(), fetchHoldings()])
      .then(([bal, h]) => {
        setBalance(bal);
        setHoldings(h);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-600">Loading portfolio...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!balance) return null;

  const cashBalance = balance.cashBalance;
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalPortfolioValue = cashBalance + totalHoldingsValue;
  const unrealizedPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Portfolio</h2>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Cash balance</p>
          <p className="text-xl font-semibold text-gray-900">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Holdings value</p>
          <p className="text-xl font-semibold text-gray-900">${totalHoldingsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total portfolio</p>
          <p className="text-xl font-semibold text-gray-900">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Unrealized P&amp;L</p>
          <p className={`text-xl font-semibold ${unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {unrealizedPnl >= 0 ? '$' : '-$'}{Math.abs(unrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <h3 className="mb-2 text-lg font-medium text-gray-800">Holdings</h3>
      {holdings.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No holdings yet. Buy stocks from the Dashboard or a stock detail page.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Avg price</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Current</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">P&amp;L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {holdings.map((h) => (
                <tr key={h.symbol}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    <Link to={`/stocks/${h.symbol}`} className="text-blue-600 hover:underline">{h.symbol}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{h.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">{h.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">${h.averagePrice.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">${h.currentPrice.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">${h.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${h.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {h.pnl >= 0 ? '$' : '-$'}{Math.abs(h.pnl).toFixed(2)}
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
