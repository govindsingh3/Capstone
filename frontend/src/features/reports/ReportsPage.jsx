import { useMemo, useState } from "react";

const rows = [
  { id: 1, institution: "CRA", score: 86, incidents: 3, updated: "2026-03-09" },
  { id: 2, institution: "North Zone College", score: 74, incidents: 5, updated: "2026-03-08" },
  { id: 3, institution: "Harbor Institute", score: 91, incidents: 2, updated: "2026-03-10" },
  { id: 4, institution: "Metro Technical", score: 69, incidents: 6, updated: "2026-03-07" },
  { id: 5, institution: "Southline Academy", score: 88, incidents: 1, updated: "2026-03-10" },
  { id: 6, institution: "Westpoint School", score: 79, incidents: 4, updated: "2026-03-06" },
];

const PAGE_SIZE = 4;

const ReportsPage = () => {
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (a[sortBy] > b[sortBy]) return direction;
      if (a[sortBy] < b[sortBy]) return -direction;
      return 0;
    });
  }, [sortBy, sortDir]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <section className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Reports</h1>
        <button type="button" onClick={exportPdf} className="interactive focus-ring rounded-full bg-secondary px-4 py-2 text-sm font-semibold">
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" aria-label="Readiness reports table">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="p-2">Institution</th>
              <th className="p-2">
                <button type="button" className="focus-ring rounded px-1" onClick={() => onSort("score")}>Score</button>
              </th>
              <th className="p-2">
                <button type="button" className="focus-ring rounded px-1" onClick={() => onSort("incidents")}>Incidents</button>
              </th>
              <th className="p-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="p-2">{row.institution}</td>
                <td className="p-2">{row.score}%</td>
                <td className="p-2">{row.incidents}</td>
                <td className="p-2">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="focus-ring rounded-full border border-white/10 px-3 py-1 text-sm"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-sm text-muted">Page {page} of {pageCount}</span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          className="focus-ring rounded-full border border-white/10 px-3 py-1 text-sm"
          disabled={page === pageCount}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default ReportsPage;
