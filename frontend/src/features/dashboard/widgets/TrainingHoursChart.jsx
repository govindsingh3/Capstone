import { trainingHoursData } from "../mockData.js";

const TrainingHoursChart = () => {
  const maxValue = Math.max(...trainingHoursData.map((item) => Math.max(item.current, item.last)));

  return (
    <article className="glass-card p-5 lg:col-span-2">
      <h2 className="mb-4 text-sm text-muted">Training Hours (Current vs Last Month)</h2>
      <div className="space-y-4">
        <div className="mb-2 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-600" />Last month</span>
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-secondary" />Current</span>
        </div>

        {trainingHoursData.map((item) => {
          const lastHeight = `${(item.last / maxValue) * 100}%`;
          const currentHeight = `${(item.current / maxValue) * 100}%`;

          return (
            <div key={item.department} className="grid grid-cols-[120px_1fr] items-end gap-3 sm:grid-cols-[160px_1fr]">
              <p className="truncate text-xs text-muted" title={item.department}>{item.department}</p>
              <div className="flex h-20 items-end gap-2 rounded-lg border border-white/10 bg-slate-900/30 px-2 py-1">
                <div className="group relative h-full w-4 rounded-t bg-slate-600" style={{ height: lastHeight }} aria-label={`${item.department} last month ${item.last} hours`}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] group-hover:block">{item.last}</span>
                </div>
                <div className="group relative h-full w-4 rounded-t bg-secondary" style={{ height: currentHeight }} aria-label={`${item.department} current ${item.current} hours`}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] group-hover:block">{item.current}</span>
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
