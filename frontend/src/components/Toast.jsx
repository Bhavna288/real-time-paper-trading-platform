import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const DURATION_MS = 4000;

export default function Toast() {
  const { lastTrade, lastAlert } = useSocket();
  const [visible, setVisible] = useState(null);
  const [type, setType] = useState(null);

  useEffect(() => {
    if (lastTrade) {
      setVisible(lastTrade);
      setType('trade');
      const t = setTimeout(() => { setVisible(null); setType(null); }, DURATION_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [lastTrade]);

  useEffect(() => {
    if (lastAlert) {
      setVisible(lastAlert);
      setType('alert');
      const t = setTimeout(() => { setVisible(null); setType(null); }, DURATION_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [lastAlert]);

  if (!visible) return null;

  if (type === 'trade') {
    const { symbol, type: orderType, quantity, price } = visible;
    const isBuy = orderType === 'BUY';
    return (
      <div
        className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg"
        role="alert"
      >
        <p className="font-medium text-gray-900">Order filled</p>
        <p className="text-sm text-gray-600">
          <span className={isBuy ? 'text-green-600' : 'text-red-600'}>{orderType}</span>
          {' '}{quantity} {symbol} @ ${Number(price).toFixed(2)}
        </p>
      </div>
    );
  }

  if (type === 'alert') {
    const { symbol, direction, targetPrice, currentPrice } = visible;
    const label = direction === 'ABOVE' ? 'reached' : 'fell to';
    return (
      <div
        className="fixed bottom-6 right-6 z-50 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"
        role="alert"
      >
        <p className="font-medium text-gray-900">Price alert</p>
        <p className="text-sm text-gray-600">
          {symbol} {label} ${Number(currentPrice).toFixed(2)} (target ${Number(targetPrice).toFixed(2)})
        </p>
      </div>
    );
  }

  return null;
}
