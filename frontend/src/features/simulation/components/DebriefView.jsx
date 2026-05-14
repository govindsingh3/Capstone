import { lazy, Suspense } from "react";

const DebriefCharts = lazy(() => import("./DebriefCharts.jsx"));

const ChartsLoader = () => (
  <div className="glass-card grid min-h-[260px] place-items-center p-6 text-sm text-muted">Loading chart analytics...</div>
);

const DebriefView = ({ report, onReset, onExport }) => {
  if (!report) return null;

  return (
    <section className="space-y-4">
      <div className="glass-card p-5">
        <h2 className="text-xl font-semibold">Post-Simulation Debrief</h2>
        <p className="mt-1 text-sm text-muted">Actionable review of performance, response speed, and resource control.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="surface-card p-3">
            <p className="text-xs text-muted">Readiness Score</p>
            <p className="text-2xl font-semibold text-secondary">{report.readinessScore}</p>
          </div>
          <div className="surface-card p-3">
            <p className="text-xs text-muted">Response Time</p>
            <p className="text-xl font-semibold">{report.breakdown.responseTime}%</p>
          </div>
          <div className="surface-card p-3">
            <p className="text-xs text-muted">Evacuation Efficiency</p>
            <p className="text-xl font-semibold">{report.breakdown.evacuationEfficiency}%</p>
          </div>
          <div className="surface-card p-3">
            <p className="text-xs text-muted">Resource Usage</p>
            <p className="text-xl font-semibold">{report.breakdown.resourceUsage}%</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ChartsLoader />}>
        <DebriefCharts report={report} />
      </Suspense>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="glass-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Heatmap (Incident vs Help)</h3>
          <div className="space-y-2">
            {report.heatmap.map((zone) => (
              <div key={zone.zoneId} className="rounded-lg ghost-btn p-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{zone.zoneName}</span>
                  <span className="text-muted">Danger {zone.dangerWeight}</span>
                </div>
                <div className="progress-track h-2">
                  <div className="h-2 rounded-full bg-rose-500" style={{ width: `${Math.min(100, zone.dangerWeight)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted">Incidents: {zone.incidents} | Help Dispatched: {zone.helpDispatched}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Action Log Review</h3>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {report.actionLog.length === 0 && <p className="text-sm text-muted">No actions recorded.</p>}
            {report.actionLog.map((entry) => (
              <div key={entry.id} className="item-card text-sm">
                <p className="text-xs text-secondary">{entry.timestamp}</p>
                <p>{entry.action} at {entry.zone}</p>
                <p className="text-xs text-muted">{entry.outcome}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-2 text-sm font-semibold">Educational Feedback</h3>
        <ul className="space-y-1 text-sm text-muted">
          {report.feedback.map((item, idx) => (
            <li key={`${item}-${idx}`}>- {item}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onExport} className="interactive focus-ring rounded-full bg-secondary px-4 py-2 text-sm font-semibold">
          Export PDF
        </button>
        <button type="button" onClick={onReset} className="interactive focus-ring rounded-full ghost-btn px-4 py-2 text-sm">
          Run New Simulation
        </button>
      </div>
    </section>
  );
};

export default DebriefView;
