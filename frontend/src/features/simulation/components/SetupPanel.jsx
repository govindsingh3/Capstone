const SetupPanel = ({ scenarios, difficulties, state, onUpdate, onStart }) => {
  return (
    <section className="glass-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Scenario Setup</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm" htmlFor="scenarioSelect">
          Scenario
          <select
            id="scenarioSelect"
            value={state.scenarioId}
            onChange={(event) => onUpdate({ scenarioId: event.target.value })}
            className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm" htmlFor="difficultySelect">
          Difficulty
          <select
            id="difficultySelect"
            value={state.difficulty}
            onChange={(event) => onUpdate({ difficulty: event.target.value })}
            className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
            ))}
          </select>
        </label>

        <label className="text-sm" htmlFor="participantsInput">
          Campus Population
          <input
            id="participantsInput"
            type="number"
            min={100}
            max={5000}
            value={state.participantCount}
            onChange={(event) => onUpdate({ participantCount: Number(event.target.value) || 0 })}
            className="focus-ring mt-1 w-full rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.soundEnabled}
            onChange={() => onUpdate({ soundEnabled: !state.soundEnabled })}
            className="h-4 w-4 rounded border-white/20 bg-slate-900/30"
          />
          Enable Alarm Sound
        </label>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="interactive focus-ring mt-5 rounded-full bg-secondary px-5 py-2 text-sm font-semibold"
      >
        Start Simulation
      </button>
    </section>
  );
};

export default SetupPanel;
