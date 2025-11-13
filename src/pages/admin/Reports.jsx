// src/pages/admin/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listProjects,
  setProjectStatus,
  getFinanceSummary,
} from "../../services/adminApi";

/* ---------------- Icons ---------------- */
const Icon = {
  Reports: () => <span>📋</span>,
  Refresh: () => <span>↻</span>,
  Back: () => <span>↩</span>,
  Download: () => <span>⬇️</span>,
};

/* ---------------- CSV Helper ---------------- */
function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = Object.keys(rows[0]);
  const csv =
    headers.map(escape).join(",") +
    "\n" +
    rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [tab, setTab] = useState("projects");
  const navigate = useNavigate();

  return (
    <div className="max-w-full bg-white dark:bg-gray-900 min-h-screen mx-auto p-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
            <Icon.Reports />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Admin Reports
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              / Reports
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
        >
          <Icon.Back /> Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("projects")}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            tab === "projects"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-300"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          }`}
        >
          Projects
        </button>

        <button
          onClick={() => setTab("finance")}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            tab === "finance"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-300"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          }`}
        >
          Finance
        </button>
      </div>

      {/* CONTENT */}
      {tab === "projects" && <ProjectsPane />}
      {tab === "finance" && <FinancePane />}
    </div>
  );
}

/* ============================ PROJECTS PANE ============================ */
function ProjectsPane() {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const statuses = useMemo(
    () => ["open", "in_progress", "completed", "archived", "flagged"],
    []
  );

  const load = async (overridePage) => {
    try {
      setErr("");
      setLoading(true);
      const params = { page: overridePage || page, limit: 12 };
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await listProjects(params);
      setRes(
        data || { items: [], page: overridePage || page, pages: 1 }
      );
    } catch (e) {
      setErr(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  const update = async (id, s) => {
    setBusy(id);
    try {
      await setProjectStatus(id, s);
      await load();
    } finally {
      setBusy("");
    }
  };

  const exportCSV = () => {
    const rows = (res?.items || []).map((p) => ({
      id: p._id,
      title: p.title || "Untitled Project",
      status: p.status || "unknown",
      client_name: p.client?.name || p.clientId?.name || "",
      client_email: p.client?.email || p.clientId?.email || "",
      developer:
        p.assignee?.name || p.freelancer?.name || p.freelancerId?.name || "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
    }));
    downloadCSV("projects.csv", rows);
  };

  const statusBg = (s) =>
    ({
      open: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      in_progress:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      completed:
        "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      archived:
        "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
      flagged:
        "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      unknown:
        "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
    }[s] || "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300");

  return (
    <>
      {/* Filter Toolbar */}
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />

          <button
            onClick={() => {
              setPage(1);
              load(1);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <Icon.Download /> Export CSV
          </button>

          {err && (
            <span className="ml-auto text-sm text-red-600 dark:text-red-400">
              {err}
            </span>
          )}
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}

        {!loading &&
          res?.items?.map((p) => (
            <div
              key={p._id}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {p.title || "Untitled Project"}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${statusBg(
                    p.status || "unknown"
                  )}`}
                >
                  {p.status || "unknown"}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {p.description || "No description provided."}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Client: {p.client?.name || p.clientId?.name || "—"} (
                {p.client?.email || p.clientId?.email || "—"})
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {statuses.map((s) => (
                  <button
                    key={s}
                    disabled={busy === p._id}
                    onClick={() => update(p._id, s)}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      p.status === s
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-300"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}

        {!loading && !err && (res?.items?.length ?? 0) === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No projects found.
          </div>
        )}

        {!loading && err && (
          <div className="col-span-full">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4 flex justify-between items-center">
              {err}
              <button
                onClick={() => load(1)}
                className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 rounded-md"
              >
                <Icon.Refresh /> Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && (res?.pages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {res?.page || page} / {res?.pages || 1}
          </span>
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            disabled={page >= (res?.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

/* ============================ FINANCE PANE ============================ */
function FinancePane() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getFinanceSummary()
      .then((d) => {
        setData(d || { invoices: [], payouts: [] });
      })
      .catch((e) => setErr(e.message || "Failed to load finance summary"));
  }, []);

  const exportCSV = () => {
    const invoices = (data?.invoices || []).map((i) => ({
      type: "invoice",
      status: i._id ?? "",
      total: Number(i.total || 0),
      count: Number(i.count || 0),
    }));
    const payouts = (data?.payouts || []).map((i) => ({
      type: "payout",
      status: i._id ?? "",
      total: Number(i.total || 0),
      count: Number(i.count || 0),
    }));
    const rows = [...invoices, ...payouts];
    downloadCSV("finance.csv", rows);
  };

  if (err)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl p-4">
        {err}
      </div>
    );

  if (!data)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse"
          >
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"
              />
            ))}
          </div>
        ))}
      </div>
    );

  const Cell = ({ title, items }) => {
    const max = Math.max(...items.map((i) => Number(i.total || 0)), 1);
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <Icon.Download /> Export CSV
          </button>
        </div>
        <ul className="space-y-3">
          {items.map((i, idx) => {
            const total = Number(i.total || 0);
            const ratio = Math.max(0.08, Math.min(1, total / max));
            return (
              <li key={idx} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {i._id ?? "—"}
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    ${total.toFixed(2)}{" "}
                    <span className="text-gray-500 dark:text-gray-400">
                      ({i.count ?? 0})
                    </span>
                  </span>
                </div>
                <div className="h-2 mt-2 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-2 rounded bg-indigo-500"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
          {!items.length && (
            <li className="text-sm text-gray-500 dark:text-gray-400">
              No data available.
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Cell title="Invoices" items={data.invoices || []} />
      <Cell title="Payouts" items={data.payouts || []} />
    </div>
  );
}

/* -------- Table Cells -------- */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left font-semibold sticky top-0 backdrop-blur-md z-10">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
  );
}
