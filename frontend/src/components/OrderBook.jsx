export default function OrderBook({ orderbook }) {
  if (!orderbook?.bids?.length && !orderbook?.asks?.length) return null;

  const bids = [...(orderbook.bids || [])].reverse();
  const asks = orderbook.asks || [];

  return (
    <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-slate-700">Order book</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-emerald-600">Bids</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>Price</th>
                <th className="text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((row, i) => (
                <tr key={i}>
                  <td className="tabular-nums text-emerald-600">${Number(row.price).toFixed(2)}</td>
                  <td className="text-right tabular-nums text-slate-700">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-red-600">Asks</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th>Price</th>
                <th className="text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {asks.map((row, i) => (
                <tr key={i}>
                  <td className="tabular-nums text-red-600">${Number(row.price).toFixed(2)}</td>
                  <td className="text-right tabular-nums text-slate-700">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
