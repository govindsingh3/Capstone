import { useEffect, useMemo, useState } from "react";
import { listInstitutions, uploadInstitutionsFile } from "../../services/institutions";

const filterDefaults = {
  q: "",
  state: "",
  type: "",
  earthquakeZone: "",
  floodRisk: "",
};

const InstitutionPage = () => {
  const [filters, setFilters] = useState(filterDefaults);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const stateOptions = useMemo(() => {
    const unique = new Set(records.map((item) => item.state).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const fetchData = async (page = 1, nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const payload = await listInstitutions({ ...nextFilters, page, limit: 12 });
      const nextRecords = payload.items || [];
      setRecords(nextRecords);
      if (!selectedInstitutionId && nextRecords.length > 0) {
        setSelectedInstitutionId(nextRecords[0]._id || nextRecords[0].institutionId || "");
      }
      setPagination(payload.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load institution records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onFilterSubmit = (event) => {
    event.preventDefault();
    fetchData(1);
  };

  const onUploadSubmit = async (event) => {
    event.preventDefault();
    if (!uploadFile) {
      setUploadStatus("Select a .csv or .json file before importing.");
      return;
    }

    try {
      setUploading(true);
      setUploadStatus("");
      const result = await uploadInstitutionsFile(uploadFile);
      setUploadStatus(
        `Import complete: ${result.processed} processed, ${result.inserted} inserted, ${result.modified} modified.`
      );
      await fetchData(1);
      setUploadFile(null);
    } catch (uploadError) {
      setUploadStatus(uploadError?.response?.data?.message || "Import failed. Check file format and try again.");
    } finally {
      setUploading(false);
    }
  };

  const summary = useMemo(() => {
    const highFlood = records.filter((item) => item.disasterMetadata?.floodRisk === "High").length;
    const zoneIvOrV = records.filter((item) => {
      const zone = item.disasterMetadata?.earthquakeZone;
      return zone === "IV" || zone === "V";
    }).length;
    return { highFlood, zoneIvOrV };
  }, [records]);

  const selectedInstitution = useMemo(
    () =>
      records.find((item) => (item._id || item.institutionId) === selectedInstitutionId) ||
      records[0] ||
      null,
    [records, selectedInstitutionId]
  );

  const selectedMapUrl = useMemo(() => {
    if (!selectedInstitution?.latitude || !selectedInstitution?.longitude) return "";
    return `https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${selectedInstitution.latitude}%2C${selectedInstitution.longitude}`;
  }, [selectedInstitution]);

  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <h1 className="text-xl font-semibold">Institution Intelligence</h1>
        <p className="mt-1 text-sm text-muted">
          Production dataset with geolocation, accreditation, and hazard metadata for preparedness planning.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={onFilterSubmit}>
          <input
            name="q"
            value={filters.q}
            onChange={onFilterChange}
            placeholder="Search name, city, code"
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
          />
          <select
            name="state"
            value={filters.state}
            onChange={onFilterChange}
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
          >
            <option value="">All states</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            name="type"
            value={filters.type}
            onChange={onFilterChange}
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="Central">Central</option>
            <option value="State">State</option>
            <option value="Deemed">Deemed</option>
            <option value="Private">Private</option>
          </select>
          <select
            name="earthquakeZone"
            value={filters.earthquakeZone}
            onChange={onFilterChange}
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
          >
            <option value="">All EQ zones</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
            <option value="V">V</option>
          </select>
          <select
            name="floodRisk"
            value={filters.floodRisk}
            onChange={onFilterChange}
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm"
          >
            <option value="">All flood risk</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="interactive focus-ring rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters(filterDefaults);
                fetchData(1, filterDefaults);
              }}
              className="focus-ring rounded-full border border-white/15 px-4 py-2 text-xs"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-xs text-muted">Records</p>
          <p className="mt-1 text-2xl font-semibold">{pagination.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted">High Flood Risk</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">{summary.highFlood}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted">Earthquake Zone IV/V</p>
          <p className="mt-1 text-2xl font-semibold text-rose-300">{summary.zoneIvOrV}</p>
        </div>
      </section>

      <section className="glass-card p-5">
        <h2 className="text-sm font-semibold">Dataset Import</h2>
        <p className="mt-1 text-xs text-muted">Upload a real institution dataset file (.csv or .json) to bulk update records.</p>

        <form className="mt-4 flex flex-col gap-3 md:flex-row md:items-center" onSubmit={onUploadSubmit}>
          <input
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={(event) => {
              const selected = event.target.files?.[0] || null;
              setUploadFile(selected);
              setUploadStatus("");
            }}
            className="focus-ring rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={uploading}
            className="interactive focus-ring w-fit rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import File"}
          </button>
          {uploadFile && <span className="text-xs text-muted">Selected: {uploadFile.name}</span>}
        </form>
        {uploadStatus && <p className="mt-3 text-xs text-emerald-300">{uploadStatus}</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Institution Map Explorer</h2>
          <p className="mt-1 text-xs text-muted">Select an institution to view its mapped coordinates.</p>
          {selectedMapUrl ? (
            <iframe
              title="Institution map"
              src={selectedMapUrl}
              className="mt-3 h-[280px] w-full rounded-xl border border-white/10"
              loading="lazy"
            />
          ) : (
            <div className="mt-3 grid h-[280px] place-items-center rounded-xl border border-white/10 bg-slate-900/20 text-xs text-muted">
              No map coordinates available.
            </div>
          )}
          {selectedInstitution?.latitude && selectedInstitution?.longitude && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${selectedInstitution.latitude}&mlon=${selectedInstitution.longitude}#map=12/${selectedInstitution.latitude}/${selectedInstitution.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5"
            >
              Open in OpenStreetMap
            </a>
          )}
        </div>
        <aside className="glass-card p-4">
          <h3 className="text-sm font-semibold">Map Selection</h3>
          <div className="mt-3 max-h-[310px] space-y-2 overflow-auto pr-1">
            {records.map((item) => {
              const key = item._id || item.institutionId;
              const isActive = key === selectedInstitutionId;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedInstitutionId(key)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? "border-emerald-300/50 bg-emerald-500/10"
                      : "border-white/10 bg-slate-900/20 hover:bg-white/5"
                  }`}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted">
                    {item.city}, {item.state}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="space-y-3">
        {loading && <div className="glass-card p-4 text-sm text-muted">Loading institution records...</div>}
        {error && <div className="glass-card p-4 text-sm text-rose-300">{error}</div>}

        {!loading && !error && records.length === 0 && (
          <div className="glass-card p-4 text-sm text-muted">No records matched the selected filters.</div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((item) => (
            <article key={item._id || item.institutionId} className="glass-card p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">{item.name}</h2>
                  <p className="text-xs text-muted">
                    {item.city}, {item.state}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">{item.status || "Active"}</span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted">Institution ID</dt>
                  <dd>{item.institutionId || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Type</dt>
                  <dd>{item.type || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Accreditation</dt>
                  <dd>{item.accreditation || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted">EQ Zone</dt>
                  <dd>{item.disasterMetadata?.earthquakeZone || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Flood Risk</dt>
                  <dd>{item.disasterMetadata?.floodRisk || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Coordinates</dt>
                  <dd>
                    {item.latitude && item.longitude
                      ? `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`
                      : "N/A"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {item.website && (
                  <a className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/5" href={item.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
                {item.contactEmail && (
                  <a className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/5" href={`mailto:${item.contactEmail}`}>
                    {item.contactEmail}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Page {pagination.page} of {Math.max(pagination.totalPages || 1, 1)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchData((pagination.page || 1) - 1)}
              className="focus-ring rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
              onClick={() => fetchData((pagination.page || 1) + 1)}
              className="focus-ring rounded-full border border-white/20 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstitutionPage;
