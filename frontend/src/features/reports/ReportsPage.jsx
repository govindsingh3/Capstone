import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { reportBasis, realLifeInstitutionReports, monthlyRiskTrend } from "./reportData.js";

const PAGE_SIZE = 5;

const getRiskIndex = (row) => {
  const incidentPressure = row.incidentsLast12m * 4;
  const severePressure = row.severeIncidents * 7;
  const responsePressure = Math.max(0, (row.avgResponseMins - 8) * 2.5);
  const preparednessOffset = (row.drillCoverage + row.evacuationCompliance + row.readinessScore) / 6;
  const vulnerabilityPressure = row.vulnerableStudentsPct * 0.9;
  return Math.round(Math.min(100, Math.max(0, incidentPressure + severePressure + responsePressure + vulnerabilityPressure - preparednessOffset)));
};

const getRiskBand = (index) => {
  if (index >= 70) return "High";
  if (index >= 45) return "Medium";
  return "Low";
};

const priorityAction = (row) => {
  if (row.avgResponseMins > 13) return "Run rapid-evacuation drills twice per month";
  if (row.evacuationCompliance < 80) return "Re-train floor marshals and route wardens";
  if (row.vulnerableStudentsPct > 18) return "Expand assisted-evacuation buddy assignments";
  return "Maintain current drill schedule and audit cadence";
};

const badgeClassByRisk = {
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

const trendTextByKey = {
  up: "Improving",
  stable: "Stable",
  down: "Declining",
};

const trendColorByKey = {
  up: "trend-up",
  stable: "trend-stable",
  down: "trend-down",
};

const ReportsPage = () => {
  const [sortBy, setSortBy] = useState("riskIndex");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hazardFilter, setHazardFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const enrichedRows = useMemo(
    () =>
      realLifeInstitutionReports.map((row) => {
        const riskIndex = getRiskIndex(row);
        return {
          ...row,
          riskIndex,
          riskBand: getRiskBand(riskIndex),
          action: priorityAction(row),
        };
      }),
    []
  );

  const hazardOptions = useMemo(() => {
    const unique = [...new Set(enrichedRows.map((row) => row.hazard))];
    return ["All", ...unique];
  }, [enrichedRows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrichedRows.filter((row) => {
      const searchMatch =
        !term ||
        row.institution.toLowerCase().includes(term) ||
        row.city.toLowerCase().includes(term) ||
        row.hazard.toLowerCase().includes(term);
      const hazardMatch = hazardFilter === "All" || row.hazard === hazardFilter;
      const riskMatch = riskFilter === "All" || row.riskBand === riskFilter;
      return searchMatch && hazardMatch && riskMatch;
    });
  }, [enrichedRows, search, hazardFilter, riskFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (a[sortBy] > b[sortBy]) return direction;
      if (a[sortBy] < b[sortBy]) return -direction;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const paged = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const summary = useMemo(() => {
    const total = filtered.length || 1;
    const readinessAvg = Math.round(filtered.reduce((sum, row) => sum + row.readinessScore, 0) / total);
    const responseAvg = (filtered.reduce((sum, row) => sum + row.avgResponseMins, 0) / total).toFixed(1);
    const highRiskCount = filtered.filter((row) => row.riskBand === "High").length;
    const totalIncidents = filtered.reduce((sum, row) => sum + row.incidentsLast12m, 0);
    return { readinessAvg, responseAvg, highRiskCount, totalIncidents, totalInstitutions: filtered.length };
  }, [filtered]);

  const hazardDistribution = useMemo(() => {
    const count = new Map();
    filtered.forEach((row) => {
      count.set(row.hazard, (count.get(row.hazard) || 0) + 1);
    });
    return [...count.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const riskMix = useMemo(() => {
    const agg = { High: 0, Medium: 0, Low: 0 };
    filtered.forEach((row) => {
      agg[row.riskBand] += 1;
    });
    return [
      { name: "High", value: agg.High, color: "#fb7185" },
      { name: "Medium", value: agg.Medium, color: "#f59e0b" },
      { name: "Low", value: agg.Low, color: "#34d399" },
    ];
  }, [filtered]);

  const onSort = (field) => {
    if (sortBy === field) {
      setSortDir((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDir("desc");
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <section className="space-y-5">
      <article className="glass-card p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title">Preparedness Reports Intelligence</h1>
            <p className="page-subtitle">Institution-level risk posture built from realistic hazard and response patterns.</p>
          </div>
          <button type="button" onClick={exportPdf} className="interactive focus-ring rounded-full bg-secondary px-4 py-2 text-sm font-semibold leading-none">
            Export PDF
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="surface-card flex min-h-[88px] flex-col justify-center p-3">
            <p className="text-xs text-muted">Institutions in view</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalInstitutions}</p>
          </div>
          <div className="surface-card flex min-h-[88px] flex-col justify-center p-3">
            <p className="text-xs text-muted">Average readiness</p>
            <p className="mt-1 text-2xl font-semibold">{summary.readinessAvg}%</p>
          </div>
          <div className="surface-card flex min-h-[88px] flex-col justify-center p-3">
            <p className="text-xs text-muted">High risk institutions</p>
            <p className="trend-down mt-1 text-2xl font-semibold">{summary.highRiskCount}</p>
          </div>
          <div className="surface-card flex min-h-[88px] flex-col justify-center p-3">
            <p className="text-xs text-muted">Avg response time</p>
            <p className="mt-1 text-2xl font-semibold">{summary.responseAvg}m</p>
          </div>
          <div className="surface-card flex min-h-[88px] flex-col justify-center p-3">
            <p className="text-xs text-muted">Incidents (12 months)</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalIncidents}</p>
          </div>
        </div>
      </article>

      <article className="glass-card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
          <input
            type="search"
            placeholder="Search institution, city, or hazard"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="panel-input focus-ring h-10 min-w-[220px] flex-1 rounded-xl px-3 text-sm"
          />
          <select
            value={hazardFilter}
            onChange={(event) => {
              setHazardFilter(event.target.value);
              setPage(1);
            }}
            className="panel-select focus-ring h-10 min-w-[170px] rounded-xl px-3 text-sm"
          >
            {hazardOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(event) => {
              setRiskFilter(event.target.value);
              setPage(1);
            }}
            className="panel-select focus-ring h-10 min-w-[130px] rounded-xl px-3 text-sm"
          >
            <option value="All">All Risk Bands</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

<<<<<<< HEAD
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm" aria-label="Preparedness reports table">
            <thead>
              <tr className="table-head text-left">
                <th className="p-3 font-semibold">Institution</th>
                <th className="p-3 font-semibold">Hazard</th>
                <th className="p-3 font-semibold">
                  <button type="button" className="focus-ring rounded px-1" onClick={() => onSort("readinessScore")}>Readiness</button>
                </th>
                <th className="p-3 font-semibold">
                  <button type="button" className="focus-ring rounded px-1" onClick={() => onSort("riskIndex")}>Risk Index</button>
                </th>
                <th className="p-3 font-semibold">Trend</th>
                <th className="p-3 font-semibold">Priority Action</th>
                <th className="p-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="table-row align-top">
                  <td className="p-3">
                    <p className="font-medium">{row.institution}</p>
                    <p className="text-xs text-muted">{row.city}</p>
                  </td>
                  <td className="p-3">{row.hazard}</td>
                  <td className="p-3">{row.readinessScore}%</td>
                  <td className="p-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClassByRisk[row.riskBand]}`}>
                      {row.riskBand} ({row.riskIndex})
                    </span>
                  </td>
                  <td className={`p-3 text-xs font-semibold ${trendColorByKey[row.readinessTrend]}`}>{trendTextByKey[row.readinessTrend]}</td>
                  <td className="p-3 text-xs leading-5 text-muted">{row.action}</td>
                  <td className="p-3">
                    <p>{row.lastAudit}</p>
                    <p className="text-xs leading-5 text-muted">{row.source}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">
            Page {clampedPage} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="icon-button focus-ring rounded-full px-3 py-1 text-sm"
            disabled={clampedPage === 1}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="icon-button focus-ring rounded-full px-3 py-1 text-sm"
            disabled={clampedPage === pageCount}
          >
            Next
          </button>
          </div>
        </div>
      </article>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="glass-card p-5 md:p-6 xl:col-span-2">
          <h2 className="section-kicker mb-4">Monthly Risk Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRiskTrend}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--chart-axis)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 12 }} domain={[30, 70]} />
                <Tooltip
                  contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--chart-tooltip-label)" }}
                />
                <Line type="monotone" dataKey="risk" stroke="var(--chart-line)" strokeWidth={3} dot={{ r: 4, fill: "var(--chart-line)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-5 md:p-6">
          <h2 className="section-kicker mb-4">Risk Mix</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskMix} dataKey="value" nameKey="name" innerRadius={44} outerRadius={78}>
                  {riskMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--chart-tooltip-label)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            {riskMix.map((item) => (
              <div key={item.name} className="panel-select rounded-lg px-2 py-1.5 text-center">
                <p className="text-muted">{item.name}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="glass-card p-5 md:p-6 xl:col-span-2">
          <h2 className="section-kicker mb-4">Hazard Exposure Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" stroke="var(--chart-axis)" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--chart-axis)" tick={{ fontSize: 12 }} width={130} />
                <Tooltip
                  contentStyle={{ background: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--chart-tooltip-label)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} fill="var(--chart-bar)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-5 md:p-6">
          <h2 className="section-kicker mb-4">Report Basis</h2>
          <div className="space-y-2 text-sm text-muted">
            {reportBasis.map((item) => (
              <p key={item} className="panel-select rounded-lg p-3 leading-6">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>
=======
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="focus-ring rounded-full ghost-btn px-3 py-1 text-sm"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-sm text-muted">Page {page} of {pageCount}</span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          className="focus-ring rounded-full ghost-btn px-3 py-1 text-sm"
          disabled={page === pageCount}
        >
          Next
        </button>
      </div>
>>>>>>> 17a7e3f37a5ab5d3984af2cc6447046e60c6916b
    </section>
  );
};

export default ReportsPage;
