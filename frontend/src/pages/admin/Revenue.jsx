// src/pages/admin/Revenue.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listInvoices,
  updateInvoiceStatus,
  listPayouts,
  updatePayoutStatus,
} from "../../services/adminApi";

const Icon = {
  Revenue: () => <span>💰</span>,
  Back: () => <span>↩</span>,
  Refresh: () => <span>↻</span>,
  Download: () => <span>⬇️</span>,
};

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

export default function Revenue() {
  const [tab, setTab] = useState("invoices");
  const navigate = useNavigate();

  return (
    <div className="max-w-full bg-white dark:bg-gray-900 min-h-screen mx-auto p-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
            <Icon.Revenue />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Revenue & Payouts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              / Revenue
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
        {[
          { key: "invoices", label: "Invoices" },
          { key: "payouts", label: "Payouts" },
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

      {tab === "invoices" ? <InvoicesPane /> : <PayoutsPane />}
    </div>
  );
}

/* ============================ Invoices ============================ */
function InvoicesPane() {
  const [status, setStatus] = useState(""); // e.g., paid/pending/failed/refunded
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);

  const statuses = useMemo(
    () => ["paid", "pending", "failed", "refunded"],
    []
  );

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const params = { page, limit: 12 };
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await listInvoices(params);
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const setStatusFn = async (id, s) => {
    setBusyId(id);
    try {
      await updateInvoiceStatus(id, s);
      await load();
    } finally {
      setBusyId("");
    }
  };

  const exportCSV = () => {
    const rows = (res?.items || []).map((i) => ({
      id: i._id,
      status: i.status || "",
      amount: Number(i.amount || 0),
      currency: i.currency || "USD",
      user: i.user?.email || i.userEmail || "",
      project: i.project?.title || i.projectTitle || "",
      createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : "",
      updatedAt: i.updatedAt ? new Date(i.updatedAt).toISOString() : "",
    }));
    downloadCSV("invoices.csv", rows);
  };

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
            <option value="">Any status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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
              load();
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

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-i-${i}`}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}

        {!loading &&
          res?.items?.map((inv) => (
            <div
              key={inv._id}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invoice • {inv._id.slice(-6)}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  inv.status === "paid"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : inv.status === "pending"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : inv.status === "failed"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                }`}>
                  {inv.status || "unknown"}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Amount: <strong>${Number(inv.amount || 0).toFixed(2)}</strong>{" "}
                {inv.currency || "USD"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                User: {inv.user?.email || inv.userEmail || "—"} • Project: {inv.project?.title || inv.projectTitle || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ""}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {["paid", "pending", "failed", "refunded"].map((s) => (
                  <button
                    key={s}
                    disabled={busyId === inv._id}
                    onClick={() => setStatusFn(inv._id, s)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition ${
                      inv.status === s
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

        {!loading && (res?.items?.length ?? 0) === 0 && !err && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No invoices found.
          </div>
        )}

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

/* ============================ Payouts ============================ */
function PayoutsPane() {
  const [status, setStatus] = useState(""); // e.g., requested/processing/sent/failed
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);

  const statuses = useMemo(
    () => ["requested", "processing", "sent", "failed"],
    []
  );

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const params = { page, limit: 12 };
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await listPayouts(params);
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const setStatusFn = async (id, s) => {
    setBusyId(id);
    try {
      await updatePayoutStatus(id, s);
      await load();
    } finally {
      setBusyId("");
    }
  };

  const exportCSV = () => {
    const rows = (res?.items || []).map((p) => ({
      id: p._id,
      status: p.status || "",
      amount: Number(p.amount || 0),
      currency: p.currency || "USD",
      freelancer: p.freelancer?.email || p.freelancerEmail || "",
      method: p.method || p.provider || "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
    }));
    downloadCSV("payouts.csv", rows);
  };

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
            <option value="">Any status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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
            onClick={() => { setPage(1); load(); }}
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

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-p-${i}`}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}

        {!loading &&
          res?.items?.map((po) => (
            <div
              key={po._id}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payout • {po._id.slice(-6)}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  po.status === "sent"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : po.status === "processing"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : po.status === "failed"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                }`}>
                  {po.status || "unknown"}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Amount: <strong>${Number(po.amount || 0).toFixed(2)}</strong>{" "}
                {po.currency || "USD"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Freelancer: {po.freelancer?.email || po.freelancerEmail || "—"} • Method: {po.method || po.provider || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {po.createdAt ? new Date(po.createdAt).toLocaleString() : ""}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {["requested", "processing", "sent", "failed"].map((s) => (
                  <button
                    key={s}
                    disabled={busyId === po._id}
                    onClick={() => setStatusFn(po._id, s)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition ${
                      po.status === s
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

        {!loading && (res?.items?.length ?? 0) === 0 && !err && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No payouts found.
          </div>
        )}

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
