export const DIFFICULTY_PRESETS = {
  easy: { label: "Easy", eventMultiplier: 0.75, escalationMultiplier: 0.7, resourceDrain: 0.8 },
  medium: { label: "Medium", eventMultiplier: 1, escalationMultiplier: 1, resourceDrain: 1 },
  hard: { label: "Hard", eventMultiplier: 1.35, escalationMultiplier: 1.3, resourceDrain: 1.25 },
};

export const CAMPUS_ZONES = [
  { id: "block-a", name: "Block A", basePopulation: 180 },
  { id: "block-b", name: "Block B", basePopulation: 220 },
  { id: "library", name: "Library", basePopulation: 120 },
  { id: "gym", name: "Gym", basePopulation: 160 },
  { id: "lab-wing", name: "Lab Wing", basePopulation: 140 },
];

export const SCENARIOS = {
  earthquake: {
    id: "earthquake",
    name: "Earthquake Response",
    description: "Major seismic event followed by aftershocks, fires, and blocked exits.",
    durationMinutes: 45,
    baseEventChance: 0.34,
    initialAlert: "Seismic sensors report strong ground motion. Initiate triage and evacuation.",
    eventPool: [
      { type: "aftershock", severity: 2, title: "Aftershock rattles the zone" },
      { type: "fire", severity: 3, title: "Electrical fire outbreak" },
      { type: "structural", severity: 3, title: "Structural integrity compromised" },
      { type: "medical", severity: 2, title: "Multiple injuries reported" },
    ],
    scriptedEvents: [
      { minute: 2, type: "aftershock", severity: 2, title: "Strong aftershock wave" },
      { minute: 7, type: "fire", severity: 3, title: "Gas leak sparks a fire" },
      { minute: 14, type: "structural", severity: 4, title: "Stairwell instability detected" },
    ],
  },
  flood: {
    id: "flood",
    name: "Flood Surge",
    description: "Rapid water level rise, power loss, and evacuation route constraints.",
    durationMinutes: 40,
    baseEventChance: 0.31,
    initialAlert: "River level has exceeded warning threshold. Move to elevated zones.",
    eventPool: [
      { type: "flooding", severity: 2, title: "Water level is rising" },
      { type: "power", severity: 2, title: "Power grid instability" },
      { type: "medical", severity: 2, title: "Hypothermia cases reported" },
      { type: "evacuation", severity: 3, title: "Evacuation route blocked" },
    ],
    scriptedEvents: [
      { minute: 3, type: "flooding", severity: 2, title: "Basement flood breach" },
      { minute: 11, type: "power", severity: 3, title: "Main transformer submerged" },
      { minute: 16, type: "evacuation", severity: 3, title: "Bridge crossing inaccessible" },
    ],
  },
  fire: {
    id: "fire",
    name: "Campus Fire",
    description: "Fast-spreading fire with smoke, panic, and communications disruption.",
    durationMinutes: 35,
    baseEventChance: 0.36,
    initialAlert: "Heat sensors identify fire in a high-density area.",
    eventPool: [
      { type: "fire", severity: 3, title: "Flames spreading across floor" },
      { type: "smoke", severity: 2, title: "Smoke density increasing" },
      { type: "medical", severity: 2, title: "Respiratory distress calls" },
      { type: "panic", severity: 2, title: "Crowd panic near exits" },
    ],
    scriptedEvents: [
      { minute: 1, type: "fire", severity: 3, title: "Initial fire ignition confirmed" },
      { minute: 6, type: "smoke", severity: 3, title: "Smoke reaches ventilation system" },
      { minute: 12, type: "panic", severity: 3, title: "Stairwell congestion spike" },
    ],
  },
  chemical: {
    id: "chemical",
    name: "Chemical Leak",
    description: "Hazmat containment scenario with contamination spread risk.",
    durationMinutes: 50,
    baseEventChance: 0.28,
    initialAlert: "Unknown chemical leak detected in Lab Wing.",
    eventPool: [
      { type: "chemical", severity: 3, title: "Toxic vapor concentration rising" },
      { type: "medical", severity: 2, title: "Exposure symptoms reported" },
      { type: "containment", severity: 3, title: "Containment barrier failure" },
      { type: "evacuation", severity: 2, title: "Hazmat evacuation delay" },
    ],
    scriptedEvents: [
      { minute: 4, type: "chemical", severity: 3, title: "Leak source intensifies" },
      { minute: 9, type: "containment", severity: 4, title: "Secondary containment crack" },
      { minute: 18, type: "medical", severity: 3, title: "Critical exposure cases" },
    ],
  },
};

export const ACTIONS = {
  dispatchFire: { label: "Dispatch Fire Team", team: "fire", cooldown: 3, fuelCost: 5 },
  dispatchMedical: { label: "Dispatch Medical", team: "medical", cooldown: 2, fuelCost: 3 },
  dispatchSecurity: { label: "Dispatch Security", team: "security", cooldown: 2, fuelCost: 2 },
  sendAlert: { label: "Send Campus Alert", cooldown: 2, fuelCost: 1 },
  lockdown: { label: "Lockdown Zone", cooldown: 4, fuelCost: 4 },
};
