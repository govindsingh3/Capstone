import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { liveAlerts, readiness } from "./mockData.js";

const TrainingHoursChart = lazy(() => import("./widgets/TrainingHoursChart.jsx"));
const IncidentTrendsChart = lazy(() => import("./widgets/IncidentTrendsChart.jsx"));

const ChartFallback = ({ className }) => (
  <div className={`glass-card animate-pulse ${className}`} aria-hidden="true" />
);

const ReadinessRing = () => {
  const [displayScore, setDisplayScore] = useState(0);
  const score = readiness.score;
  const circumference = 2 * Math.PI * 45;
  const progress = circumference - (score / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayScore(current);
      if (current >= score) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="glass-card p-5">
      <p className="mb-3 text-sm text-muted">Readiness Score</p>
      <div className="relative mx-auto h-36 w-36">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100" aria-label="Readiness score gauge">
          <circle cx="50" cy="50" r="45" stroke="rgba(148,163,184,0.2)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="#3B82F6"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.2 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-3xl font-semibold">{displayScore}%</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-4">
        <ReadinessRing />

        <Suspense fallback={<ChartFallback className="h-[324px] p-5 lg:col-span-2" />}>
          <TrainingHoursChart />
        </Suspense>

        <article className="glass-card p-5">
          <h2 className="mb-3 text-sm text-muted">Live Alerts</h2>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {liveAlerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-white/10 bg-slate-900/30 p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm">{alert.label}</p>
                  <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">{alert.level}</span>
                </div>
                <p className="text-xs text-muted">{alert.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <Suspense fallback={<ChartFallback className="h-[368px] p-5" />}>
        <IncidentTrendsChart />
      </Suspense>
    </div>
  );
};

export default DashboardPage;
