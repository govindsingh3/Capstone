import { lazy, Suspense } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { SimulationProvider, useSimulation } from "./SimulationContext.jsx";
import SetupPanel from "./components/SetupPanel.jsx";
import MetricsBoard from "./components/MetricsBoard.jsx";
import IncidentFeed from "./components/IncidentFeed.jsx";
import CampusMap from "./components/CampusMap.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import TeamStatusPanel from "./components/TeamStatusPanel.jsx";
import AlertsPanel from "./components/AlertsPanel.jsx";
const DebriefView = lazy(() => import("./components/DebriefView.jsx"));

const DebriefLoader = () => (
  <div className="glass-card grid min-h-[220px] place-items-center p-6 text-sm text-muted">Preparing debrief analytics...</div>
);

const SpeedControl = ({ speed, onChange }) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full p-1" style={{ border: '1px solid var(--btn-border)' }}>
      {[1, 2, 4].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`focus-ring rounded-full px-3 py-1 text-xs font-medium ${speed === value ? "bg-secondary text-white" : ""}`}
          style={speed !== value ? { color: 'var(--text-primary)' } : {}}
        >
          {value}x
        </button>
      ))}
    </div>
  );
};

const SimulationContent = () => {
  const {
    state,
    scenarios,
    difficulties,
    actions,
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
  } = useSimulation();

  const selectedZone = state.zones.find((zone) => zone.id === state.selectedZoneId);
  const isRunning = state.phase === "running";
  const isPaused = state.phase === "paused";

  if (state.phase === "setup") {
    return (
      <SetupPanel
        scenarios={scenarios}
        difficulties={difficulties}
        state={state}
        onUpdate={updateSetup}
        onStart={startSimulation}
      />
    );
  }

  if (state.phase === "completed") {
    return (
      <Suspense fallback={<DebriefLoader />}>
        <DebriefView report={state.report} onReset={resetSimulation} onExport={exportReport} />
      </Suspense>
    );
  }

  return (
    <div className="space-y-4">
      <header className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="text-xl font-semibold">Simulation Command Center</h1>
          <p className="text-sm text-muted">Live disaster drill with dynamic incidents and real-time consequences.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SpeedControl speed={state.speed} onChange={setSpeed} />
          <button type="button" onClick={toggleSound} className="focus-ring rounded-full p-2" style={{ border: '1px solid var(--btn-border)' }} aria-label="Toggle alarm sound">
            {state.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {isRunning ? (
            <button type="button" onClick={pauseSimulation} className="focus-ring rounded-full p-2" style={{ border: '1px solid var(--btn-border)' }} aria-label="Pause simulation">
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={resumeSimulation} className="focus-ring rounded-full p-2" style={{ border: '1px solid var(--btn-border)' }} aria-label="Resume simulation">
              <Play className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={stopSimulation} className="focus-ring rounded-full px-3 py-2 text-sm font-medium text-rose-600" style={{ border: '1px solid rgba(220,38,38,0.5)' }}>
            End Drill
          </button>
          <button type="button" onClick={resetSimulation} className="focus-ring rounded-full p-2" style={{ border: '1px solid var(--btn-border)' }} aria-label="Reset simulation">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <MetricsBoard state={state} formattedDuration={formattedDuration} />

      <section className="grid gap-4 xl:grid-cols-4">
        <div className="space-y-4 xl:col-span-2">
          <CampusMap zones={state.zones} selectedZoneId={state.selectedZoneId} onSelectZone={setSelectedZone} />
          <IncidentFeed feed={state.incidentFeed} />
        </div>

        <div className="space-y-4">
          <ActionPanel
            actions={actions}
            teams={state.teams}
            resources={state.resources}
            selectedZone={selectedZone}
            onAction={performAction}
          />
          <TeamStatusPanel teams={state.teams} />
        </div>

        <div className="space-y-4">
          <AssistantPanel riskLevel={state.riskLevel} advice={state.aiAdvice} />
          <AlertsPanel alerts={state.alerts} />
        </div>
      </section>

      {isPaused && <p className="text-sm text-amber-300">Simulation paused. Resume to continue event progression.</p>}
    </div>
  );
};

const SimulationLabPage = () => {
  return (
    <SimulationProvider>
      <SimulationContent />
    </SimulationProvider>
  );
};

export default SimulationLabPage;
