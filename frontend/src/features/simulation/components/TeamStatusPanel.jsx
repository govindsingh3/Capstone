const TeamStatusPanel = ({ teams }) => {
  return (
    <section className="glass-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Team Status</h3>
      <div className="space-y-2">
        {Object.entries(teams).map(([name, team]) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/30 p-2">
            <span className="text-sm capitalize">{name}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${team.available ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              {team.available ? "Available" : `Cooldown ${team.cooldown}m`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamStatusPanel;
