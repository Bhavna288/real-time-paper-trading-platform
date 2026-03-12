import { useState } from 'react';
import { placeOrder } from '../api/orders';

const ORDER_KINDS = [
  { value: 'MARKET', label: 'Market' },
  { value: 'LIMIT', label: 'Limit' },
  { value: 'STOP', label: 'Stop' },
];

export default function OrderForm({ symbol, currentPrice, onSuccess }) {
  const [type, setType] = useState('BUY');
  const [orderKind, setOrderKind] = useState('MARKET');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
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
    if (orderKind === 'LIMIT' && (!limitPrice || Number(limitPrice) <= 0)) {
      setMessage('Enter a valid limit price');
      setIsError(true);
      return;
    }
    if (orderKind === 'STOP' && (!stopPrice || Number(stopPrice) <= 0)) {
      setMessage('Enter a valid stop price');
      setIsError(true);
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      const result = await placeOrder(symbol, type, qty, orderKind, limitPrice || undefined, stopPrice || undefined);
      if (result.status === 'PENDING') {
        const trigger = orderKind === 'LIMIT' ? `limit $${Number(result.limitPrice).toFixed(2)}` : `stop $${Number(result.stopPrice).toFixed(2)}`;
        setMessage(`${orderKind} order placed: ${qty} ${symbol} @ ${trigger}`);
      } else {
        setMessage(`${type} order filled: ${qty} @ $${Number(result.price).toFixed(2)}`);
      }
      setIsError(false);
      setQuantity('');
      setLimitPrice('');
      setStopPrice('');
      onSuccess?.();
    } catch (err) {
      setMessage(err.message || 'Order failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-medium text-slate-800">Place order</h3>
      {currentPrice != null && (
        <p className="mb-3 text-sm text-slate-600">Current price: ${Number(currentPrice).toFixed(2)}</p>
      )}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setType('BUY')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${type === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setType('SELL')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${type === 'SELL' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        >
          Sell
        </button>
      </div>
      <div className="mb-3">
        <label htmlFor="order-kind" className="mb-1 block text-sm text-slate-600">Order type</label>
        <select
          id="order-kind"
          value={orderKind}
          onChange={(e) => setOrderKind(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {ORDER_KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </div>
      {orderKind === 'LIMIT' && (
        <div className="mb-3">
          <label htmlFor="limit-price" className="mb-1 block text-sm text-slate-600">Limit price ($)</label>
          <input
            id="limit-price"
            type="number"
            step="0.01"
            min="0"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="e.g. 150.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={loading}
          />
        </div>
      )}
      {orderKind === 'STOP' && (
        <div className="mb-3">
          <label htmlFor="stop-price" className="mb-1 block text-sm text-slate-600">Stop price ($)</label>
          <input
            id="stop-price"
            type="number"
            step="0.01"
            min="0"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            placeholder="e.g. 140.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={loading}
          />
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="qty" className="mb-1 block text-sm text-slate-600">Quantity</label>
        <input
          id="qty"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          disabled={loading}
        />
      </div>
      {message && (
        <p className={`mb-3 text-sm ${isError ? 'text-red-600' : 'text-emerald-600'}`}>{message}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Placing...' : `Place ${orderKind.toLowerCase()} ${type.toLowerCase()} order`}
      </button>
    </form>
  );
}
