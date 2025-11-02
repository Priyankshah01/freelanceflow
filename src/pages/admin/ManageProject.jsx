// src/pages/admin/ManageProject.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProjects, setProjectStatus } from "../../services/adminApi";

const Icon = {
  Projects: () => <span>📁</span>,
  Refresh: () => <span>↻</span>,
  Back: () => <span>↩</span>,
};

export default function ManageProject() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statuses = useMemo(
    () => ["open", "in_progress", "completed", "archived", "flagged"],
    []
  );

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const params = { page, limit: 12 };
      if (status) params.status = status;
      const data = await listProjects(params);
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // page change should reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
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

  return (
    <div className="max-w-full bg-white dark:bg-gray-900 min-h-screen mx-auto p-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
            <Icon.Projects />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Manage Projects
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              / Projects
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

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skeletons */}
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
                  <div
                    key={j}
                    className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"
                  />
                ))}
              </div>
            </div>
          ))}

        {/* Cards */}
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

        {/* Empty */}
        {!loading && (res?.items?.length ?? 0) === 0 && !err && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No projects found.
          </div>
        )}

        {/* Error (retry) */}
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
    </div>
  );
}
