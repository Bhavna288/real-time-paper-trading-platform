import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlerts, createAlert, deleteAlert } from '../api/alerts';

const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];
const DIRECTIONS = [
  { value: 'ABOVE', label: 'Above' },
  { value: 'BELOW', label: 'Below' },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [addError, setAddError] = useState(null);

  function loadAlerts() {
    setLoading(true);
    fetchAlerts()
      .then(setAlerts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const price = targetPrice.trim();
    if (!symbol || !price) return;
    setAddError(null);
    try {
      await createAlert(symbol, direction, price);
      setSymbol('');
      setTargetPrice('');
      loadAlerts();
    } catch (err) {
      setAddError(err.message);
    }
  }

  async function handleDelete(alertId) {
    try {
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && alerts.length === 0) return <p className="p-6 text-gray-600">Loading alerts...</p>;
  if (error && alerts.length === 0) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Price alerts</h2>
      <p className="mb-6 text-sm text-gray-600">
        Get notified when a stock price goes above or below your target. Alerts trigger once and then show as triggered.
      </p>

      <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label htmlFor="alert-symbol" className="mb-1 block text-sm text-gray-600">Symbol</label>
          <select
            id="alert-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="alert-direction" className="mb-1 block text-sm text-gray-600">When price</label>
          <select
            id="alert-direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="alert-price" className="mb-1 block text-sm text-gray-600">Target price ($)</label>
          <input
            id="alert-price"
            type="number"
            step="0.01"
            min="0"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 150"
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!symbol || !targetPrice.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add alert
        </button>
        {addError && <p className="w-full text-sm text-red-600">{addError}</p>}
      </form>

      {alerts.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">No alerts. Add one above.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Condition</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    <Link to={`/stocks/${a.symbol}`} className="text-blue-600 hover:underline">
                      {a.symbol}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{a.direction === 'ABOVE' ? 'Above' : 'Below'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">${Number(a.targetPrice).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {a.triggeredAt ? (
                      <span className="text-amber-600">Triggered</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!a.triggeredAt && (
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
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
