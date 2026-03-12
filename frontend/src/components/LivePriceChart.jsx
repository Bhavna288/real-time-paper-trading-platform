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

export default function LivePriceChart({ data, title = 'Live price' }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-slate-700">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            tick={{ fontSize: 11 }}
            stroke="#64748b"
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            tick={{ fontSize: 11 }}
            stroke="#64748b"
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            labelFormatter={formatTime}
          />
          <Line type="linear" dataKey="price" stroke="#7c3aed" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
