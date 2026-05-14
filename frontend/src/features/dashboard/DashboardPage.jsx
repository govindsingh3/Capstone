import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { liveAlerts, readiness } from "./mockData.js";
import { fetchLiveAlerts } from "../../services/alerts.js";
import { fetchNearbyResources } from "../../services/resources.js";
import { fetchQuizSecuritySummary } from "../../services/security.js";
import { useAuth } from "../../hooks/useAuth.js";

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
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(liveAlerts);
  const [resources, setResources] = useState([]);
  const [securitySummary, setSecuritySummary] = useState(null);
  const [securityState, setSecurityState] = useState("idle");
  const [locationState, setLocationState] = useState({
    status: "pending",
    lat: null,
    lon: null,
    cityHint: "Location pending",
  });

  useEffect(() => {
    let isMounted = true;

    const onSuccess = (position) => {
      if (!isMounted) return;
      setLocationState({
        status: "enabled",
        lat: Number(position.coords.latitude.toFixed(4)),
        lon: Number(position.coords.longitude.toFixed(4)),
        cityHint: "Location enabled",
      });
    };

    const onError = () => {
      if (!isMounted) return;
      setLocationState({
        status: "blocked",
        lat: null,
        lon: null,
        cityHint: "Location disabled",
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 5000,
      });
    } else {
      onError();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncAlertsAndResources = async () => {
      try {
        const payload = await fetchLiveAlerts({
          lat: locationState.lat ?? undefined,
          lon: locationState.lon ?? undefined,
        });
        if (!ignore && payload?.alerts?.length) {
          setAlerts(
            payload.alerts.map((item, index) => ({
              id: `${item.source}-${index}-${item.timestamp}`,
              label: item.title,
              level: item.level,
              time: new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }))
          );
        }

        if (
          locationState.status === "enabled" &&
          typeof locationState.lat === "number" &&
          typeof locationState.lon === "number"
        ) {
          const nearby = await fetchNearbyResources({
            lat: locationState.lat,
            lon: locationState.lon,
            type: "all",
            limit: 4,
          });

          if (!ignore) setResources(nearby.resources || []);
        }
      } catch (error) {
        if (!ignore) {
          setAlerts(liveAlerts);
          setResources([]);
        }
      }
    };

    syncAlertsAndResources();

    return () => {
      ignore = true;
    };
  }, [locationState.lat, locationState.lon, locationState.status]);

  useEffect(() => {
    let ignore = false;
    const role = user?.role;
    const canViewSecurity = role === "Administrator" || role === "DisasterOfficer";
    if (!canViewSecurity) return () => {};

    const loadSecurity = async () => {
      setSecurityState("loading");
      try {
        const payload = await fetchQuizSecuritySummary(24);
        if (ignore) return;
        setSecuritySummary(payload);
        setSecurityState("ready");
      } catch (error) {
        if (!ignore) setSecurityState("failed");
      }
    };

    loadSecurity();
    return () => {
      ignore = true;
    };
  }, [user?.role]);

  const riskSummary = useMemo(() => {
    const score = alerts.reduce((sum, item) => {
      if (item.level === "High") return sum + 3;
      if (item.level === "Medium") return sum + 2;
      if (item.level === "Low") return sum + 1;
      return sum + 0.5;
    }, 0);

    if (score >= 9) return { label: "High", className: "text-rose-300", note: "Activate rapid-response readiness" };
    if (score >= 5) return { label: "Medium", className: "text-amber-300", note: "Maintain heightened monitoring" };
    return { label: "Low", className: "text-emerald-300", note: "Continue routine preparedness" };
  }, [alerts]);

  const levelBadgeClass = (level) => {
    if (level === "High") return "bg-rose-500/20 text-rose-300";
    if (level === "Medium") return "bg-amber-500/20 text-amber-300";
    if (level === "Low") return "bg-emerald-500/20 text-emerald-300";
    return "bg-secondary/20 text-secondary";
  };

  const canViewSecurity = user?.role === "Administrator" || user?.role === "DisasterOfficer";

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-4">
        <ReadinessRing />

        <Suspense fallback={<ChartFallback className="h-[324px] p-5 lg:col-span-2" />}>
          <TrainingHoursChart />
        </Suspense>

        <article className="glass-card p-5 md:p-6">
          <h2 className="section-kicker mb-3">Live Alerts</h2>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div key={alert.id} className="panel-select rounded-lg p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm">{alert.label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${levelBadgeClass(alert.level)}`}>{alert.level}</span>
                </div>
                <p className="text-xs text-muted">{alert.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="glass-card p-5 md:p-6 xl:col-span-1">
          <h2 className="section-kicker mb-2">Location-Aware Risk Pulse</h2>
          <p className={`text-2xl font-semibold ${riskSummary.className}`}>{riskSummary.label} Risk</p>
          <p className="mt-2 text-sm text-muted">{riskSummary.note}</p>
          <div className="panel-select mt-3 rounded-lg p-3 text-xs text-muted">
            <p>Status: {locationState.cityHint}</p>
            <p>
              Coordinates:{" "}
              {typeof locationState.lat === "number" && typeof locationState.lon === "number"
                ? `${locationState.lat}, ${locationState.lon}`
                : "Unavailable"}
            </p>
          </div>
        </article>

        <article className="glass-card p-5 md:p-6 xl:col-span-2">
          <h2 className="section-kicker mb-3">Nearby Emergency Resources</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {resources.length ? (
              resources.map((resource) => (
                <div key={resource.id} className="panel-select rounded-lg p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{resource.name}</p>
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">
                      {resource.distanceKm} km
                    </span>
                  </div>
                  <p className="text-xs capitalize text-muted">{resource.type} • {resource.city}</p>
                  <p className="mt-1 text-xs text-muted">Contact: {resource.phone}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted md:col-span-2">
                Enable location access to show nearest shelters, hospitals, and police support points.
              </p>
            )}
          </div>
        </article>
      </section>

      <Suspense fallback={<ChartFallback className="h-[368px] p-5" />}>
        <IncidentTrendsChart />
      </Suspense>

      {canViewSecurity && (
        <section className="grid gap-4 xl:grid-cols-3">
          <article className="glass-card p-5 md:p-6 xl:col-span-1">
            <h2 className="section-kicker mb-2">Quiz Security Monitor (24h)</h2>
            {securityState === "loading" && <p className="text-sm text-muted">Loading security telemetry...</p>}
            {securityState === "failed" && <p className="text-sm text-amber-300">Security telemetry unavailable.</p>}
            {securityState === "ready" && securitySummary?.summary && (
              <div className="space-y-2 text-sm">
                <p className="text-emerald-300">Successful submits: {securitySummary.summary.successCount}</p>
                <p className="text-rose-300">Replay blocks: {securitySummary.summary.replayAttempts}</p>
                <p className="text-amber-300">Rejected/invalid: {securitySummary.summary.rejectionCount}</p>
                <p className="text-muted">Total events: {securitySummary.summary.totalEvents}</p>
              </div>
            )}
          </article>

          <article className="glass-card p-5 md:p-6 xl:col-span-2">
            <h2 className="section-kicker mb-3">Recent Quiz Security Events</h2>
            {securityState === "ready" && Array.isArray(securitySummary?.recent) && securitySummary.recent.length ? (
              <div className="space-y-2">
                {securitySummary.recent.slice(0, 6).map((event) => (
                  <div key={event.id} className="panel-select rounded-lg p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm capitalize">{String(event.outcome || "unknown").replaceAll("_", " ")}</p>
                      <span className="text-xs text-muted">
                        {event.submittedAt ? new Date(event.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {event.reason ? `Reason: ${event.reason}` : "Reason: -"}
                      {typeof event.score === "number" ? ` • Score: ${event.score}%` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No recent security events to display.</p>
            )}
          </article>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
