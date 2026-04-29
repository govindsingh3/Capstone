const riskTone = {
  Low: "bg-emerald-500/15 text-emerald-300",
  Medium: "bg-amber-500/15 text-amber-300",
  High: "bg-rose-500/15 text-rose-300",
};

const AssistantPanel = ({ riskLevel, advice }) => {
  return (
    <section className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Command Assistant</h3>
        <span className={`rounded-full px-3 py-1 text-xs ${riskTone[riskLevel] || riskTone.Low}`}>Risk: {riskLevel}</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-slate-900/30 p-3">
        <p className="text-sm font-medium">{advice.headline}</p>
        <p className="mt-2 text-sm text-muted">{advice.recommendation}</p>
      </div>
    </section>
  );
};

export default AssistantPanel;
