import { create } from "zustand";

const baseTeams = {
  fire: { available: true, cooldown: 0, deployedZone: null },
  medical: { available: true, cooldown: 0, deployedZone: null },
  security: { available: true, cooldown: 0, deployedZone: null },
};

export const createInitialSimulationState = () => ({
  phase: "setup",
  scenarioId: "earthquake",
  difficulty: "medium",
  speed: 1,
  soundEnabled: true,
  participantCount: 700,
  elapsedSeconds: 0,
  tickMinute: 0,
  readinessScore: 75,
  riskLevel: "Low",
  people: {
    total: 700,
    evacuated: 0,
    injured: 0,
    missing: 0,
    casualties: 0,
  },
  metrics: {
    responseTimePenalty: 0,
    evacuationEfficiency: 0,
    resourceUsage: 0,
  },
  resources: {
    fuel: 100,
    alertsRemaining: 5,
  },
  teams: baseTeams,
  zones: [],
  activeIncidents: [],
  incidentFeed: [],
  alerts: [],
  actionLog: [],
  aiAdvice: {
    headline: "Awaiting simulation start.",
    recommendation: "Select scenario and set participants.",
  },
  selectedZoneId: "block-a",
  lockedSetup: false,
  report: null,
});

export const useSimulationStore = create((set) => ({
  ...createInitialSimulationState(),
  patchState: (patch) => set((state) => ({ ...state, ...patch })),
  resetState: () => set(() => createInitialSimulationState()),
}));
