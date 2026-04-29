const predictions = [
  { title: "Flood Preparedness", confidence: 92, summary: "Resource allocation is above benchmark in lowlands." },
  { title: "Earthquake Readiness", confidence: 78, summary: "Shelter communication drills need increased cadence." },
  { title: "Fire Response", confidence: 85, summary: "Evacuation route retention improved 11% this quarter." },
];

const messages = [
  { from: "ai", text: "Recommend increasing simulation frequency for Region 3 by 2 sessions/month." },
  { from: "user", text: "What is the expected impact on readiness score?" },
  { from: "ai", text: "Estimated +4.2 readiness points over 6 weeks if attendance remains stable." },
];

const AIInsightsPage = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="space-y-4 lg:col-span-2">
        {predictions.map((item) => (
          <article key={item.title} className="glass-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{item.title}</h2>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">{item.confidence}% confidence</span>
            </div>
            <p className="text-sm text-muted">{item.summary}</p>
          </article>
        ))}
      </section>

      <aside className="glass-card flex h-[420px] flex-col p-4">
        <h2 className="mb-3 text-sm text-muted">AI Recommendation Chat</h2>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((msg, index) => (
            <div
              key={`${msg.from}-${index}`}
              className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                msg.from === "ai" ? "bg-secondary/15 text-slate-100" : "ml-auto bg-white/10"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <input
          aria-label="Type recommendation query"
          type="text"
          placeholder="Ask AI for guidance..."
          className="focus-ring mt-3 rounded-full border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
        />
      </aside>
    </div>
  );
};

export default AIInsightsPage;
