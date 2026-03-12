import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

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
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stocks/:symbol" element={<div className="p-6">Stock detail — coming soon</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
