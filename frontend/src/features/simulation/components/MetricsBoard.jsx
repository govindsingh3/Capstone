import { Timer, Users, UserCheck, UserX, Activity } from "lucide-react";

const MetricCard = ({ icon: Icon, label, value, tone = "text-slate-100" }) => (
  <div className="glass-card p-3">
    <div className="mb-1 flex items-center gap-2 text-xs text-muted">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <p className={`text-xl font-semibold ${tone}`}>{value}</p>
  </div>
);

const MetricsBoard = ({ state, formattedDuration }) => {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon={Users} label="Total People" value={state.people.total} />
      <MetricCard icon={UserCheck} label="Evacuated" value={state.people.evacuated} tone="text-emerald-300" />
      <MetricCard icon={Activity} label="Injured" value={state.people.injured} tone="text-amber-300" />
      <MetricCard icon={UserX} label="Missing" value={state.people.missing} tone="text-rose-300" />
      <MetricCard icon={Timer} label="Drill Timer" value={formattedDuration} />
    </section>
  );
};

export default MetricsBoard;
