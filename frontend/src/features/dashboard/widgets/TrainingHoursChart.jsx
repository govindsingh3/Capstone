import { trainingHoursData } from "../mockData.js";

const TrainingHoursChart = () => {
  const maxValue = Math.max(...trainingHoursData.map((item) => Math.max(item.current, item.last)));

  return (
    <article className="glass-card p-5 lg:col-span-2">
      <h2 className="mb-4 text-sm text-muted">Training Hours (Current vs Last Month)</h2>
      <div className="space-y-4">
        <div className="mb-2 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--text-muted)' }} />Last month</span>
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-secondary" />Current</span>
        </div>

        {trainingHoursData.map((item) => {
          const lastHeight = `${(item.last / maxValue) * 100}%`;
          const currentHeight = `${(item.current / maxValue) * 100}%`;

          return (
            <div key={item.department} className="grid grid-cols-[120px_1fr] items-end gap-3 sm:grid-cols-[160px_1fr]">
              <p className="truncate text-xs text-muted" title={item.department}>{item.department}</p>
<<<<<<< HEAD
              <div className="panel-select flex h-20 items-end gap-2 rounded-lg px-2 py-1">
                <div className="group relative h-full w-4 rounded-t bg-slate-600" style={{ height: lastHeight }} aria-label={`${item.department} last month ${item.last} hours`}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-[var(--chart-tooltip-bg)] px-2 py-1 text-[10px] group-hover:block">{item.last}</span>
                </div>
                <div className="group relative h-full w-4 rounded-t bg-secondary" style={{ height: currentHeight }} aria-label={`${item.department} current ${item.current} hours`}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-[var(--chart-tooltip-bg)] px-2 py-1 text-[10px] group-hover:block">{item.current}</span>
=======
              <div className="item-card flex h-20 items-end gap-2 px-2 py-1">
                <div className="group relative h-full w-4 rounded-t" style={{ height: lastHeight, background: 'var(--text-muted)' }} aria-label={`${item.department} last month ${item.last} hours`}>
                  <span className="surface-card pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded px-2 py-1 text-[10px] group-hover:block" style={{ color: 'var(--text-primary)' }}>{item.last}</span>
                </div>
                <div className="group relative h-full w-4 rounded-t bg-secondary" style={{ height: currentHeight }} aria-label={`${item.department} current ${item.current} hours`}>
                  <span className="surface-card pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded px-2 py-1 text-[10px] group-hover:block" style={{ color: 'var(--text-primary)' }}>{item.current}</span>
>>>>>>> 17a7e3f37a5ab5d3984af2cc6447046e60c6916b
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default TrainingHoursChart;
