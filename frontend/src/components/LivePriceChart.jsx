import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export default function LivePriceChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Live price</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            labelFormatter={formatTime}
          />
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
