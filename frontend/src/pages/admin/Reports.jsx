// src/pages/admin/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listProjects,
  setProjectStatus,
  getFinanceSummary,
  listAudits,
} from "../../services/adminApi";

const Icon = {
  Reports: () => <span>📋</span>,
  Refresh: () => <span>↻</span>,
  Back: () => <span>↩</span>,
};

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

        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
        >
          <Icon.Back /> Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "projects", label: "Projects" },
          { key: "finance", label: "Finance" },
          { key: "audits", label: "Audit Logs" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg border transition ${
              tab === t.key
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-300"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "projects" && <ProjectsPane />}
      {tab === "finance" && <FinancePane />}
      {tab === "audits" && <AuditsPane />}
    </div>
  );
}

/* ---------------- Projects ---------------- */
function ProjectsPane() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const params = { page, limit: 12 };
      if (status) params.status = status; // avoid sending empty status=
      const data = await listProjects(params);
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const statuses = useMemo(
    () => ["open", "in_progress", "completed", "archived", "flagged"],
    []
  );

  return (
    <>
      {/* Toolbar */}
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply
          </button>

          {err && (
            <span className="ml-auto text-sm text-red-600 dark:text-red-400">
              {err}
            </span>
          )}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="mt-4 flex gap-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          ))}

        {/* Real items */}
        {!loading &&
          res?.items?.map((p) => (
            <div
              key={p._id}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {p.title || "Untitled Project"}
                </h3>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {p.status || "unknown"}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {p.description || "No description provided."}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Client: {p.client?.name || p.clientId?.name || "—"} (
                {p.client?.email || p.clientId?.email || "—"})
                {p.assignee?.name ||
                p.freelancer?.name ||
                p.freelancerId?.name ? (
                  <>
                    {" "}
                    • Dev:{" "}
                    {p.assignee?.name ||
                      p.freelancer?.name ||
                      p.freelancerId?.name}
                  </>
                ) : null}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {statuses.map((s) => (
                  <button
                    key={s}
                    disabled={busy === p._id}
                    onClick={() => update(p._id, s)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition ${
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

        {/* Empty state */}
        {!loading && (res?.items?.length ?? 0) === 0 && !err && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No projects found.
          </div>
        )}

        {/* Error block with retry (when not loading) */}
        {!loading && err && (
          <div className="col-span-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4 flex items-center justify-between">
              <span>{err}</span>
              <button
                onClick={load}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Icon.Refresh /> Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && res?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {res.page} / {res.pages}
          </span>
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page >= res.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- Finance ---------------- */
function FinancePane() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getFinanceSummary()
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load finance summary"));
  }, []);

  if (err)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4">
        {err}
      </div>
    );

  if (!data)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md animate-pulse"
          >
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"
              />
            ))}
          </div>
        ))}
      </div>
    );

  const Cell = ({ title, items }) => (
    <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((i) => (
          <li
            key={i._id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700 dark:text-gray-300">
              {i._id ?? "—"}
            </span>
            <span className="text-gray-900 dark:text-white font-semibold">
              ${Number(i.total || 0).toFixed(2)}{" "}
              <span className="text-gray-500 dark:text-gray-400 font-normal">
                ({i.count ?? 0})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Cell title="Invoices" items={data.invoices || []} />
      <Cell title="Payouts" items={data.payouts || []} />
    </div>
  );
}

/* ---------------- Audits ---------------- */
function AuditsPane() {
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await listAudits({ page, limit: 30 });
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  if (err)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-4">
        {err}
      </div>
    );

  if (loading)
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md animate-pulse">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        ))}
      </div>
    );

  return (
    <>
      <div className="overflow-x-auto bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm backdrop-blur-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/70 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
            <tr>
              <Th>Time</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Meta</Th>
            </tr>
          </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {res?.items?.map((a) => (
              <tr key={a._id} className="text-gray-800 dark:text-gray-100">
                <Td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}</Td>
                <Td>{a.action ?? "—"}</Td>
                <Td>{a.targetId ?? "—"}</Td>
                <Td>
                  <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(a.meta ?? {}, null, 2)}
                  </pre>
                </Td>
              </tr>
            ))}
            {(res?.items?.length ?? 0) === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {res?.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {res.page} / {res.pages}
          </span>
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page >= res.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- Tiny table cell components ---------- */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left font-semibold sticky top-0 backdrop-blur-md z-10">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
