import { formatINR } from "../../../lib/formatters.js";

export default function SellerOverview({ seller }) {
  const metrics = seller?.metrics;
  return (
    <article className="panel seller-panel">
      <div className="panel-heading">
        <div><div className="section-kicker">SELLER OVERVIEW</div><h2>{seller?.storeName || "Loading seller..."}</h2></div>
        <span className="category-tag">{seller?.category || "Sample store"}</span>
      </div>
      <div className="metrics-grid">
        <Metric label="This month sales" value={metrics ? formatINR(metrics.thisMonth.sales) : "—"} />
        <Metric label="Orders" value={metrics?.thisMonth.orders ?? "—"} />
        <Metric label="Cancellation rate" value={metrics ? `${metrics.thisMonth.cancellationRate}%` : "—"} />
        <Metric label="Out of stock" value={metrics?.thisMonth.outOfStockProducts ?? "—"} />
      </div>
      {metrics && <div className="sales-compare">
        <div className="compare-label"><span>Sales performance</span><strong className="negative">↓ 32.5%</strong></div>
        <Bar label="Last month" value={metrics.lastMonth.sales} width="100%" />
        <Bar label="This month" value={metrics.thisMonth.sales} width="67.5%" />
      </div>}
    </article>
  );
}

function Metric({ label, value }) {
  return <div className="metric-card"><div className="metric-top">{label}</div><strong>{value}</strong></div>;
}

function Bar({ label, value, width }) {
  return <div className="bar-row"><span>{label}</span><div className="bar-track"><div className="bar current" style={{ width }} /></div><b>{formatINR(value)}</b></div>;
}
