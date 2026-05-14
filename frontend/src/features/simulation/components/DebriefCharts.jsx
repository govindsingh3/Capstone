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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="metric" stroke="var(--chart-axis)" fontSize={12} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12 }} labelStyle={{ color: "var(--chart-tooltip-label)" }} />
              <Bar dataKey="value" fill="var(--chart-bar)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Incident vs Response Heatmap View</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="zone" stroke="var(--chart-axis)" fontSize={11} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12 }} labelStyle={{ color: "var(--chart-tooltip-label)" }} />
              <Bar dataKey="incidents" fill="var(--chart-danger)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="deployed" fill="var(--chart-line)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
};

export default DebriefCharts;
