import { useEffect, useRef } from "react";

const IncidentFeed = ({ feed }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [feed]);

  return (
    <section className="glass-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Live Incident Feed</h3>
      <div ref={scrollRef} className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {feed.length === 0 && <p className="text-sm text-muted">No incident activity yet.</p>}
        {feed.map((entry) => (
          <article key={entry.id} className="item-card text-sm">
            <p className="mb-0.5 text-xs text-secondary">{entry.timestamp}</p>
            <p>{entry.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default IncidentFeed;
