const zoneColor = {
  safe: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const zoneGeometry = {
  "block-a": { x: 30, y: 40, width: 110, height: 75 },
  "block-b": { x: 170, y: 40, width: 120, height: 75 },
  library: { x: 320, y: 40, width: 110, height: 75 },
  gym: { x: 70, y: 145, width: 140, height: 85 },
  "lab-wing": { x: 250, y: 145, width: 160, height: 85 },
};

const CampusMap = ({ zones, selectedZoneId, onSelectZone }) => {
  return (
    <section className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Interactive Campus Map</h3>
        <p className="text-xs text-muted">Click zone to dispatch teams</p>
      </div>
      <svg viewBox="0 0 470 260" className="w-full rounded-lg p-2" style={{ border: '1px solid var(--border)', background: 'var(--input-bg)' }} role="img" aria-label="Campus danger zone map">
        <rect x="8" y="8" width="454" height="244" rx="10" fill="#0B1225" stroke="#1E293B" />
        {zones.map((zone) => {
          const geo = zoneGeometry[zone.id];
          if (!geo) return null;
          const isSelected = selectedZoneId === zone.id;
          return (
            <g key={zone.id} onClick={() => onSelectZone(zone.id)}>
              <rect
                x={geo.x}
                y={geo.y}
                width={geo.width}
                height={geo.height}
                rx="8"
                fill={zoneColor[zone.status] || zoneColor.safe}
                fillOpacity={isSelected ? 0.58 : 0.35}
                stroke={isSelected ? "#3B82F6" : "rgba(148,163,184,0.4)"}
                strokeWidth={isSelected ? 3 : 1.3}
                style={{ cursor: "pointer" }}
              />
              <text x={geo.x + 8} y={geo.y + 20} fill="#E2E8F0" fontSize="12" fontWeight="600">{zone.name}</text>
              <text x={geo.x + 8} y={geo.y + 37} fill="#CBD5E1" fontSize="11">Integrity: {zone.integrity}%</text>
              <text x={geo.x + 8} y={geo.y + 52} fill="#CBD5E1" fontSize="11">Incidents: {zone.incidents}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Safe</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Warning</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Danger</span>
      </div>
    </section>
  );
};

export default CampusMap;
