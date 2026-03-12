import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [priceUpdates, setPriceUpdates] = useState([]);
  const [lastTrade, setLastTrade] = useState(null);

  useEffect(() => {
    const s = io(window.location.origin, { path: '/socket.io', transports: ['websocket', 'polling'] });
    setSocket(s);
    s.on('price_update', (updates) => setPriceUpdates(updates));
    s.on('trade_update', (payload) => setLastTrade(payload));
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, priceUpdates, lastTrade }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
