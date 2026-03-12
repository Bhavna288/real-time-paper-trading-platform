import { useState } from 'react';
import { placeOrder } from '../api/orders';

export default function OrderForm({ symbol, currentPrice, onSuccess }) {
  const [type, setType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setMessage('Enter a valid quantity');
      setIsError(true);
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      const result = await placeOrder(symbol, type, qty);
      setMessage(`${type} order filled: ${qty} @ $${result.price.toFixed(2)}`);
      setIsError(false);
      setQuantity('');
      onSuccess?.();
    } catch (err) {
      setMessage(err.message || 'Order failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-lg font-medium text-gray-800">Place order</h3>
      {currentPrice != null && (
        <p className="mb-3 text-sm text-gray-600">Current price: ${Number(currentPrice).toFixed(2)}</p>
      )}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setType('BUY')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${type === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setType('SELL')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${type === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Sell
        </button>
      </div>
      <div className="mb-3">
        <label htmlFor="qty" className="mb-1 block text-sm text-gray-600">Quantity</label>
        <input
          id="qty"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      {message && (
        <p className={`mb-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Placing...' : `Place ${type} order`}
      </button>
    </form>
  );
}
