const ActionPanel = ({ actions, teams, resources, selectedZone, onAction }) => {
  return (
    <section className="glass-card p-4">
      <h3 className="mb-2 text-sm font-semibold">Decision Panel</h3>
      <p className="mb-3 text-xs text-muted">Selected zone: {selectedZone?.name || "None"}</p>
      <div className="mb-3 flex gap-3 text-xs text-muted">
        <span>Fuel: {resources.fuel}</span>
        <span>Alerts Remaining: {resources.alertsRemaining}</span>
      </div>
      <div className="grid gap-2">
        {Object.entries(actions).map(([key, action]) => {
          const team = action.team ? teams[action.team] : null;
          const disabled = (team && !team.available) || resources.fuel < action.fuelCost;
          const label = team && !team.available ? `${action.label} (${team.cooldown}m cd)` : action.label;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onAction(key)}
              disabled={disabled}
              className="focus-ring interactive rounded-full border border-white/15 px-4 py-2 text-sm text-left disabled:cursor-not-allowed disabled:opacity-45"
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ActionPanel;
