import { useCallback, useEffect, useMemo, useRef } from "react";
import { ACTIONS, CAMPUS_ZONES, DIFFICULTY_PRESETS, SCENARIOS } from "./scenarioConfig.js";
import { createInitialSimulationState, useSimulationStore } from "./simulationStore.js";

const STORAGE_KEY = "dpres_simulation_state_v1";

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const formatTimestamp = (minute) => {
  const baseHour = 10;
  const minutes = minute % 60;
  const hours = baseHour + Math.floor(minute / 60);
  const hour12 = hours > 12 ? hours - 12 : hours;
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const getRiskLabel = (risk) => {
  if (risk >= 75) return "High";
  if (risk >= 40) return "Medium";
  return "Low";
};

const createZones = (participantCount) => {
  const totalBase = CAMPUS_ZONES.reduce((sum, zone) => sum + zone.basePopulation, 0);
  return CAMPUS_ZONES.map((zone) => {
    const scaled = Math.round((zone.basePopulation / totalBase) * participantCount);
    return {
      ...zone,
      status: "safe",
      integrity: 100,
      occupants: scaled,
      evacuated: 0,
      incidents: 0,
      helpDispatched: 0,
    };
  });
};

const getAdviceForState = (state) => {
  const topIncident = state.activeIncidents[0];
  if (!topIncident) {
    return {
      headline: "Situation stable. Keep monitoring key zones.",
      recommendation: "Run preventative alerts and pre-position teams for faster reaction.",
    };
  }

  if (topIncident.severity >= 4) {
    return {
      headline: `${topIncident.zoneName} is in critical condition (${topIncident.type}).`,
      recommendation: "Dispatch specialized team immediately and issue a campus-wide alert.",
    };
  }

  if (state.resources.alertsRemaining <= 1) {
    return {
      headline: "Alert reserves are low.",
      recommendation: "Use targeted alerts only for high-risk zones and prioritize evacuation corridors.",
    };
  }

  if (state.people.missing > 20) {
    return {
      headline: "Missing count is trending up.",
      recommendation: "Deploy security sweeps in blocked routes and mark safe rendezvous points.",
    };
  }

  return {
    headline: `Elevated risk at ${topIncident.zoneName}.`,
    recommendation: "Coordinate fire and medical teams to cut escalation before next event cycle.",
  };
};

const buildReport = (state) => {
  const totalActions = state.actionLog.length || 1;
  const responseScore = Math.max(0, 100 - Math.round(state.metrics.responseTimePenalty));
  const evacScore = Math.min(100, Math.round((state.people.evacuated / Math.max(state.people.total, 1)) * 100));
  const resourceScore = Math.max(0, 100 - Math.round(state.metrics.resourceUsage));
  const readinessScore = Math.round((responseScore * 0.35) + (evacScore * 0.45) + (resourceScore * 0.2));

  const feedback = [];
  if (responseScore < 60) feedback.push("You responded too slowly to high-severity incidents. Improve dispatch timing.");
  if (evacScore < 70) feedback.push("Evacuation efficiency was below target. Send alerts earlier and lock down dangerous zones faster.");
  if (resourceScore < 65) feedback.push("Resource usage was inefficient. Coordinate teams to reduce duplicate deployments.");
  if (!feedback.length) feedback.push("Excellent coordination. Continue balancing rapid response with resource control.");

  return {
    readinessScore,
    breakdown: {
      responseTime: responseScore,
      evacuationEfficiency: evacScore,
      resourceUsage: resourceScore,
    },
    summary: {
      elapsedMinutes: state.tickMinute,
      incidentsHandled: totalActions,
      casualties: state.people.casualties,
      injured: state.people.injured,
    },
    feedback,
    heatmap: state.zones.map((zone) => ({
      zoneId: zone.id,
      zoneName: zone.name,
      dangerWeight: Math.max(0, 100 - zone.integrity + zone.incidents * 8),
      helpDispatched: zone.helpDispatched,
      incidents: zone.incidents,
    })),
    actionLog: state.actionLog,
  };
};

export const useSimulationEngine = () => {
  const state = useSimulationStore();
  const audioRef = useRef(null);

  const scenario = useMemo(() => SCENARIOS[state.scenarioId] || SCENARIOS.earthquake, [state.scenarioId]);
  const difficulty = useMemo(() => DIFFICULTY_PRESETS[state.difficulty] || DIFFICULTY_PRESETS.medium, [state.difficulty]);

  const persistState = useCallback((nextState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, []);

  const pushFeed = useCallback((message, level = "info") => {
    const latest = useSimulationStore.getState();
    const entry = {
      id: `feed-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: formatTimestamp(latest.tickMinute),
      message,
      level,
    };
    state.patchState({ incidentFeed: [...latest.incidentFeed.slice(-119), entry] });
  }, [state]);

  const triggerAlarm = useCallback((frequency = 600) => {
    if (!state.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioRef.current) audioRef.current = new AudioContextClass();
      const context = audioRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    } catch (_error) {
      // Gracefully ignore audio failures in restricted browsers.
    }
  }, [state.soundEnabled]);

  const finalizeSimulation = useCallback(() => {
    const latest = useSimulationStore.getState();
    const report = buildReport(latest);
    const next = {
      ...latest,
      phase: "completed",
      report,
      readinessScore: report.readinessScore,
      riskLevel: "Low",
      activeIncidents: [],
      alerts: [...latest.alerts.slice(-19), { id: `alert-${Date.now()}`, level: "success", message: "Simulation complete. Debrief is ready." }],
    };
    state.patchState(next);
    persistState(next);
  }, [persistState, state]);

  const spawnIncident = useCallback((source, scripted = false) => {
    const latest = useSimulationStore.getState();
    const zone = randomFrom(latest.zones);
    if (!zone) return;
    const eventTemplate = source || randomFrom(scenario.eventPool);
    const incident = {
      id: `incident-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      zoneId: zone.id,
      zoneName: zone.name,
      type: eventTemplate.type,
      title: eventTemplate.title,
      severity: eventTemplate.severity,
      minuteRaised: latest.tickMinute,
      handled: false,
    };

    const nextZones = latest.zones.map((item) => {
      if (item.id !== zone.id) return item;
      const danger = incident.severity >= 4 ? "danger" : incident.severity >= 2 ? "warning" : "safe";
      return {
        ...item,
        status: danger,
        integrity: Math.max(25, item.integrity - incident.severity * 6),
        incidents: item.incidents + 1,
      };
    });

    const alerts = [...latest.alerts.slice(-24)];
    if (incident.severity >= 3) {
      alerts.push({
        id: `alert-${incident.id}`,
        level: "critical",
        message: `${incident.zoneName}: ${incident.title}`,
      });
      triggerAlarm(incident.severity >= 4 ? 760 : 640);
    }

    const next = {
      ...latest,
      zones: nextZones,
      activeIncidents: [incident, ...latest.activeIncidents],
      alerts,
    };

    state.patchState(next);
    pushFeed(`${incident.zoneName}: ${incident.title}${scripted ? " (scripted event)" : ""}`, incident.severity >= 3 ? "critical" : "warning");
  }, [pushFeed, scenario.eventPool, state, triggerAlarm]);

  const applyTickConsequences = useCallback(() => {
    const latest = useSimulationStore.getState();
    const unresolved = latest.activeIncidents.filter((item) => !item.handled);

    let injuredDelta = 0;
    let missingDelta = 0;
    let casualtyDelta = 0;

    unresolved.forEach((incident) => {
      const age = latest.tickMinute - incident.minuteRaised;
      if (age >= 2) injuredDelta += Math.max(0, incident.severity - 1);
      if (age >= 3) missingDelta += Math.max(0, incident.severity - 2);
      if (age >= 5) casualtyDelta += Math.max(0, incident.severity - 3);
    });

    const alertsPenalty = latest.resources.alertsRemaining <= 0 ? 3 : 0;
    const responsePenalty = unresolved.reduce((sum, incident) => sum + incident.severity * 0.6, 0);
    const evacProgress = Math.max(0, Math.floor((latest.resources.alertsRemaining > 0 ? 8 : 3) - unresolved.length * 0.8));

    const nextPeople = {
      ...latest.people,
      evacuated: Math.min(latest.people.total, latest.people.evacuated + evacProgress),
      injured: Math.min(latest.people.total, latest.people.injured + injuredDelta),
      missing: Math.min(latest.people.total, latest.people.missing + missingDelta),
      casualties: Math.min(latest.people.total, latest.people.casualties + casualtyDelta),
    };

    const riskNumeric = Math.min(100, (unresolved.length * 14) + (nextPeople.injured * 0.08) + (nextPeople.casualties * 0.6) + alertsPenalty);
    const riskLevel = getRiskLabel(riskNumeric);

    const nextTeams = Object.fromEntries(
      Object.entries(latest.teams).map(([teamName, team]) => {
        const cooldown = Math.max(0, team.cooldown - 1);
        return [teamName, { ...team, cooldown, available: cooldown === 0, deployedZone: cooldown === 0 ? null : team.deployedZone }];
      })
    );

    const next = {
      ...latest,
      elapsedSeconds: latest.elapsedSeconds + 1,
      tickMinute: latest.tickMinute + 1,
      people: nextPeople,
      teams: nextTeams,
      metrics: {
        responseTimePenalty: latest.metrics.responseTimePenalty + responsePenalty,
        evacuationEfficiency: (nextPeople.evacuated / Math.max(1, nextPeople.total)) * 100,
        resourceUsage: Math.min(100, 100 - latest.resources.fuel),
      },
      riskLevel,
      readinessScore: Math.max(0, Math.round(100 - (riskNumeric * 0.7) - (nextPeople.casualties * 0.5))),
    };

    const advice = getAdviceForState(next);
    const patched = { ...next, aiAdvice: advice };
    state.patchState(patched);
    persistState(patched);

    if (patched.tickMinute >= scenario.durationMinutes || patched.people.casualties >= Math.max(8, Math.floor(patched.people.total * 0.05))) {
      finalizeSimulation();
    }
  }, [finalizeSimulation, persistState, scenario.durationMinutes, state]);

  const startSimulation = useCallback(() => {
    const zones = createZones(state.participantCount);
    const next = {
      ...createInitialSimulationState(),
      phase: "running",
      scenarioId: state.scenarioId,
      difficulty: state.difficulty,
      speed: state.speed,
      soundEnabled: state.soundEnabled,
      participantCount: state.participantCount,
      people: {
        total: state.participantCount,
        evacuated: 0,
        injured: 0,
        missing: 0,
        casualties: 0,
      },
      zones,
      selectedZoneId: zones[0]?.id || "block-a",
      lockedSetup: true,
      incidentFeed: [
        {
          id: `feed-${Date.now()}`,
          timestamp: formatTimestamp(0),
          message: scenario.initialAlert,
          level: "info",
        },
      ],
      alerts: [{ id: `alert-${Date.now()}`, level: "warning", message: scenario.initialAlert }],
      aiAdvice: {
        headline: "Simulation started.",
        recommendation: "Send initial alert and deploy teams to high-density blocks.",
      },
    };

    state.patchState(next);
    persistState(next);
  }, [persistState, scenario.initialAlert, state]);

  const pauseSimulation = useCallback(() => {
    const next = { ...useSimulationStore.getState(), phase: "paused" };
    state.patchState(next);
    persistState(next);
  }, [persistState, state]);

  const resumeSimulation = useCallback(() => {
    const next = { ...useSimulationStore.getState(), phase: "running" };
    state.patchState(next);
    persistState(next);
  }, [persistState, state]);

  const stopSimulation = useCallback(() => {
    finalizeSimulation();
  }, [finalizeSimulation]);

  const performAction = useCallback((actionKey) => {
    const action = ACTIONS[actionKey];
    const latest = useSimulationStore.getState();
    if (!action || latest.phase !== "running") return;

    if (action.team) {
      const team = latest.teams[action.team];
      if (!team || !team.available) {
        state.patchState({
          alerts: [...latest.alerts.slice(-24), { id: `alert-${Date.now()}`, level: "warning", message: `${action.label} unavailable (cooldown active).` }],
        });
        return;
      }
    }

    if (latest.resources.fuel < action.fuelCost) {
      state.patchState({
        alerts: [...latest.alerts.slice(-24), { id: `alert-${Date.now()}`, level: "critical", message: "Insufficient fuel resources for this action." }],
      });
      return;
    }

    const selectedZone = latest.zones.find((zone) => zone.id === latest.selectedZoneId) || latest.zones[0];
    const activeInZone = latest.activeIncidents.find((incident) => !incident.handled && incident.zoneId === selectedZone?.id);

    const nextIncidents = latest.activeIncidents.map((incident) => {
      if (activeInZone && incident.id === activeInZone.id) {
        return {
          ...incident,
          severity: Math.max(1, incident.severity - (action.team ? 2 : 1)),
          handled: action.team ? incident.severity <= 2 : false,
        };
      }
      return incident;
    });

    const nextZones = latest.zones.map((zone) => {
      if (zone.id !== selectedZone?.id) return zone;
      return {
        ...zone,
        status: actionKey === "lockdown" ? "warning" : "safe",
        helpDispatched: zone.helpDispatched + 1,
        integrity: Math.min(100, zone.integrity + (action.team ? 5 : 2)),
      };
    });

    const nextTeams = { ...latest.teams };
    if (action.team) {
      nextTeams[action.team] = {
        ...nextTeams[action.team],
        available: false,
        cooldown: Math.ceil(action.cooldown * difficulty.escalationMultiplier),
        deployedZone: selectedZone?.id || null,
      };
    }

    const alertsRemaining = actionKey === "sendAlert" ? Math.max(0, latest.resources.alertsRemaining - 1) : latest.resources.alertsRemaining;
    const evacuatedBonus = actionKey === "sendAlert" ? 18 : action.team ? 9 : 5;

    const next = {
      ...latest,
      activeIncidents: nextIncidents.filter((item) => !(item.handled && item.severity <= 1)),
      zones: nextZones,
      teams: nextTeams,
      resources: {
        fuel: Math.max(0, latest.resources.fuel - Math.ceil(action.fuelCost * difficulty.resourceDrain)),
        alertsRemaining,
      },
      people: {
        ...latest.people,
        evacuated: Math.min(latest.people.total, latest.people.evacuated + evacuatedBonus),
      },
      actionLog: [
        ...latest.actionLog,
        {
          id: `action-${Date.now()}`,
          minute: latest.tickMinute,
          timestamp: formatTimestamp(latest.tickMinute),
          action: action.label,
          zone: selectedZone?.name || "Campus",
          outcome: activeInZone ? `Mitigated ${activeInZone.type} severity.` : "Preventative action executed.",
        },
      ],
      alerts: [
        ...latest.alerts.slice(-24),
        {
          id: `alert-${Date.now()}`,
          level: "info",
          message: `${action.label} executed in ${selectedZone?.name || "Campus"}.`,
        },
      ],
    };

    const advice = getAdviceForState(next);
    const patched = { ...next, aiAdvice: advice };

    state.patchState(patched);
    pushFeed(`${action.label} executed at ${selectedZone?.name || "Campus"}.`, "info");
    persistState(patched);
  }, [difficulty.escalationMultiplier, difficulty.resourceDrain, persistState, pushFeed, state]);

  const updateSetup = useCallback((patch) => {
    if (state.lockedSetup) return;
    const next = { ...useSimulationStore.getState(), ...patch };
    state.patchState(next);
  }, [state]);

  const setSelectedZone = useCallback((zoneId) => {
    state.patchState({ selectedZoneId: zoneId });
  }, [state]);

  const setSpeed = useCallback((speed) => {
    state.patchState({ speed });
  }, [state]);

  const toggleSound = useCallback(() => {
    state.patchState({ soundEnabled: !state.soundEnabled });
  }, [state]);

  const resetSimulation = useCallback(() => {
    state.resetState();
    localStorage.removeItem(STORAGE_KEY);
  }, [state]);

  const exportReport = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      state.patchState(parsed);
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  useEffect(() => {
    if (state.phase !== "running") return undefined;

    const intervalMs = Math.max(250, 1000 / Math.max(1, state.speed));
    const timer = setInterval(() => {
      const latest = useSimulationStore.getState();
      const scripted = scenario.scriptedEvents.find((event) => event.minute === latest.tickMinute);
      const chance = scenario.baseEventChance * difficulty.eventMultiplier;

      if (scripted) {
        spawnIncident(scripted, true);
      } else if (Math.random() < chance) {
        spawnIncident(null, false);
      }

      applyTickConsequences();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [applyTickConsequences, difficulty.eventMultiplier, scenario.baseEventChance, scenario.scriptedEvents, spawnIncident, state.phase, state.speed]);

  const formattedDuration = useMemo(() => {
    const hours = Math.floor(state.elapsedSeconds / 3600);
    const minutes = Math.floor((state.elapsedSeconds % 3600) / 60);
    const seconds = state.elapsedSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [state.elapsedSeconds]);

  return {
    state,
    scenario,
    difficulty,
    scenarios: Object.values(SCENARIOS),
    difficulties: Object.entries(DIFFICULTY_PRESETS).map(([value, config]) => ({ value, label: config.label })),
    actions: ACTIONS,
    formattedDuration,
    updateSetup,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    performAction,
    setSelectedZone,
    setSpeed,
    toggleSound,
    exportReport,
  };
};
