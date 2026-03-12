import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const DURATION_MS = 4000;

export default function Toast() {
  const { lastTrade } = useSocket();
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (!lastTrade) return;
    setVisible(lastTrade);
    const t = setTimeout(() => setVisible(null), DURATION_MS);
    return () => clearTimeout(t);
  }, [lastTrade]);

  if (!visible) return null;

  const { symbol, type, quantity, price } = visible;
  const isBuy = type === 'BUY';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg"
      role="alert"
    >
      <p className="font-medium text-gray-900">Order filled</p>
      <p className="text-sm text-gray-600">
        <span className={isBuy ? 'text-green-600' : 'text-red-600'}>{type}</span>
        {' '}{quantity} {symbol} @ ${Number(price).toFixed(2)}
      </p>
    </div>
  );
}
