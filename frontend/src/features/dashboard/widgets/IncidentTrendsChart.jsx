import { AlertTriangle } from "lucide-react";
import { incidentTrendsData } from "../mockData.js";

const IncidentTrendsChart = () => {
  const values = incidentTrendsData.map((item) => item.risk);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 640;
  const height = 240;
  const padding = 24;
  const xStep = (width - padding * 2) / (incidentTrendsData.length - 1);

  const normalizeY = (value) => {
    if (max === min) return height / 2;
    const ratio = (value - min) / (max - min);
    return height - padding - ratio * (height - padding * 2);
  };

  const points = incidentTrendsData
    .map((item, index) => `${padding + index * xStep},${normalizeY(item.risk)}`)
    .join(" ");

  return (
    <section>
      <article className="glass-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <h2 className="text-sm text-muted">Incident Trends (Risk Index)</h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Incident trend line chart">
            {incidentTrendsData.map((item, index) => {
              const x = padding + index * xStep;
              return (
                <g key={item.week}>
                  <line x1={x} x2={x} y1={padding} y2={height - padding} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 4" />
                  <text x={x} y={height - 6} textAnchor="middle" fill="#94A3B8" fontSize="11">{item.week}</text>
                </g>
              );
            })}

            {[0, 1, 2, 3].map((tick) => {
              const y = padding + ((height - padding * 2) / 3) * tick;
              return <line key={tick} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(148,163,184,0.16)" />;
            })}

            <polyline points={points} fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {incidentTrendsData.map((item, index) => {
              const x = padding + index * xStep;
              const y = normalizeY(item.risk);
              return (
                <g key={`${item.week}-dot`}>
                  <circle cx={x} cy={y} r="4" fill="#06B6D4" />
                  <title>{`${item.week}: ${item.risk}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      </article>
    </section>
  );
};

export default IncidentTrendsChart;
