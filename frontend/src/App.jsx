import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import TradeHistory from './pages/TradeHistory';
import OrderHistory from './pages/OrderHistory';
import Alerts from './pages/Alerts';
import Toast from './components/Toast';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-gray-600">
              Paper Trading
            </Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/portfolio" className="text-sm text-gray-600 hover:text-gray-900">
              Portfolio
            </Link>
            <Link to="/watchlist" className="text-sm text-gray-600 hover:text-gray-900">
              Watchlist
            </Link>
            <Link to="/trades" className="text-sm text-gray-600 hover:text-gray-900">
              Trade History
            </Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
              Order History
            </Link>
            <Link to="/alerts" className="text-sm text-gray-600 hover:text-gray-900">
              Alerts
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/trades" element={<TradeHistory />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
        </Routes>
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default App;
