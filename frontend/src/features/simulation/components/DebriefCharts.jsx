import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DebriefCharts = ({ report }) => {
  const breakdownData = [
    { metric: "Response", value: report.breakdown.responseTime },
    { metric: "Evacuation", value: report.breakdown.evacuationEfficiency },
    { metric: "Resource", value: report.breakdown.resourceUsage },
  ];

  const heatmapData = report.heatmap.map((zone) => ({
    zone: zone.zoneName,
    incidents: zone.incidents,
    deployed: zone.helpDispatched,
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <article className="glass-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Performance Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="metric" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12 }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Incident vs Response Heatmap View</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="zone" stroke="#94A3B8" fontSize={11} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12 }} />
              <Bar dataKey="incidents" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="deployed" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
};

export default DebriefCharts;
