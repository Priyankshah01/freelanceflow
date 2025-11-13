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
  Close: () => <span>✕</span>,
};

/* ---------------- CSV helper ---------------- */
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

/* ---------------- Status helpers ---------------- */
const INVOICE_STATUSES = ["paid", "pending", "failed", "refunded"];
const PAYOUT_STATUSES = ["requested", "processing", "sent", "failed"];

const invoiceStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "failed":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    case "refunded":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
  }
};

const payoutStatusClass = (status) => {
  switch (status) {
    case "sent":
      return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "processing":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "failed":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    case "requested":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
  }
};

/* ============================ Page Wrapper ============================ */

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
              Revenue &amp; Payouts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link
                to="/admin"
                className="text-indigo-600 dark:text-indigo-400"
              >
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
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [busyBulk, setBusyBulk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detail, setDetail] = useState(null); // invoice for modal

  const statuses = useMemo(() => INVOICE_STATUSES, []);

  const load = async (overridePage) => {
    try {
      setErr("");
      setLoading(true);
      const params = { page: overridePage || page, limit: 12 };
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await listInvoices(params);
      setRes(
        data || {
          items: [],
          page: overridePage || page,
          pages: 1,
        }
      );
      // reset selection when page/filter changes
      setSelectedIds([]);
    } catch (e) {
      setErr(e.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
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

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (!res?.items) return;
    setSelectedIds(checked ? res.items.map((i) => i._id).filter(Boolean) : []);
  };

  const bulkUpdate = async (targetStatus) => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Set status to "${targetStatus}" for ${selectedIds.length} invoice(s)?`
      )
    )
      return;

    setBusyBulk(true);
    try {
      for (const id of selectedIds) {
        if (!id) continue;
        try {
          // eslint-disable-next-line no-await-in-loop
          await updateInvoiceStatus(id, targetStatus);
        } catch (e) {
          console.error("bulk update invoice error:", e);
        }
      }
      await load();
    } finally {
      setBusyBulk(false);
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
    if (!rows.length) return;
    downloadCSV("invoices.csv", rows);
  };

  // summary by status (current page only)
  const summary = useMemo(() => {
    const items = res?.items || [];
    const out = {
      totalAmount: 0,
      byStatus: {},
    };
    for (const inv of items) {
      const s = (inv.status || "unknown").toLowerCase();
      const amt = Number(inv.amount || 0);
      out.totalAmount += amt;
      if (!out.byStatus[s]) out.byStatus[s] = { amount: 0, count: 0 };
      out.byStatus[s].amount += amt;
      out.byStatus[s].count += 1;
    }
    return out;
  }, [res]);

  const maxBarAmount = useMemo(() => {
    const vals = Object.values(summary.byStatus).map((v) => v.amount || 0);
    return Math.max(1, ...vals);
  }, [summary]);

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Total (this page)
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ${summary.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Across {res?.items?.length || 0} invoice(s)
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Breakdown by status
          </p>
          <div className="space-y-1.5">
            {INVOICE_STATUSES.map((s) => {
              const data = summary.byStatus[s] || { amount: 0, count: 0 };
              const ratio = Math.max(
                0.06,
                Math.min(1, data.amount / maxBarAmount)
              );
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-0.5">
                    <span>{s}</span>
                    <span>
                      ${data.amount.toFixed(2)}{" "}
                      <span className="text-gray-400">
                        ({data.count || 0})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-1.5 rounded bg-indigo-500"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!res?.items?.length && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No invoices on this page.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Bulk actions
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Selected:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {selectedIds.length}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {INVOICE_STATUSES.map((s) => (
              <button
                key={s}
                disabled={!selectedIds.length || busyBulk}
                onClick={() => bulkUpdate(s)}
                className={`px-3 py-1.5 text-xs rounded-md border transition ${
                  selectedIds.length && !busyBulk
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70"
                }`}
              >
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
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
          res?.items?.map((inv) => {
            const shortId = inv?._id ? inv._id.slice(-6) : "—";
            const checked = selectedIds.includes(inv._id);
            return (
              <div
                key={inv._id || Math.random().toString(36).slice(2)}
                className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) =>
                        handleSelectOne(inv._id, e.target.checked)
                      }
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Invoice • {shortId}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${invoiceStatusClass(
                      inv.status || "unknown"
                    )}`}
                  >
                    {inv.status || "unknown"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Amount:{" "}
                  <strong>
                    ${Number(inv.amount || 0).toFixed(2)}{" "}
                    {inv.currency || "USD"}
                  </strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  User: {inv.user?.email || inv.userEmail || "—"} • Project:{" "}
                  {inv.project?.title || inv.projectTitle || "—"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setDetail(inv)}
                    className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    View details
                  </button>

                  {INVOICE_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={busyId === inv._id}
                      onClick={() => inv._id && setStatusFn(inv._id, s)}
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
            );
          })}

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
                onClick={() => load(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Icon.Refresh /> Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && (res?.pages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {res?.page || page} / {res?.pages || 1}
          </span>
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page >= (res?.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <Modal onClose={() => setDetail(null)} title="Invoice details">
          <DetailRow label="ID" value={detail._id} />
          <DetailRow label="Status" value={detail.status || "unknown"} />
          <DetailRow
            label="Amount"
            value={`${Number(detail.amount || 0).toFixed(2)} ${
              detail.currency || "USD"
            }`}
          />
          <DetailRow
            label="User"
            value={detail.user?.email || detail.userEmail || "—"}
          />
          <DetailRow
            label="Project"
            value={detail.project?.title || detail.projectTitle || "—"}
          />
          <DetailRow
            label="Created at"
            value={
              detail.createdAt
                ? new Date(detail.createdAt).toLocaleString()
                : "—"
            }
          />
          <DetailRow
            label="Updated at"
            value={
              detail.updatedAt
                ? new Date(detail.updatedAt).toLocaleString()
                : "—"
            }
          />
        </Modal>
      )}
    </>
  );
}

/* ============================ Payouts ============================ */

function PayoutsPane() {
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");
  const [busyBulk, setBusyBulk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detail, setDetail] = useState(null);

  const statuses = useMemo(() => PAYOUT_STATUSES, []);

  const load = async (overridePage) => {
    try {
      setErr("");
      setLoading(true);
      const params = { page: overridePage || page, limit: 12 };
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await listPayouts(params);
      setRes(
        data || {
          items: [],
          page: overridePage || page,
          pages: 1,
        }
      );
      setSelectedIds([]);
    } catch (e) {
      setErr(e.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
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

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (!res?.items) return;
    setSelectedIds(checked ? res.items.map((p) => p._id).filter(Boolean) : []);
  };

  const bulkUpdate = async (targetStatus) => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Set status to "${targetStatus}" for ${selectedIds.length} payout(s)?`
      )
    )
      return;

    setBusyBulk(true);
    try {
      for (const id of selectedIds) {
        if (!id) continue;
        try {
          // eslint-disable-next-line no-await-in-loop
          await updatePayoutStatus(id, targetStatus);
        } catch (e) {
          console.error("bulk update payout error:", e);
        }
      }
      await load();
    } finally {
      setBusyBulk(false);
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
    if (!rows.length) return;
    downloadCSV("payouts.csv", rows);
  };

  // summary
  const summary = useMemo(() => {
    const items = res?.items || [];
    const out = {
      totalAmount: 0,
      byStatus: {},
    };
    for (const po of items) {
      const s = (po.status || "unknown").toLowerCase();
      const amt = Number(po.amount || 0);
      out.totalAmount += amt;
      if (!out.byStatus[s]) out.byStatus[s] = { amount: 0, count: 0 };
      out.byStatus[s].amount += amt;
      out.byStatus[s].count += 1;
    }
    return out;
  }, [res]);

  const maxBarAmount = useMemo(() => {
    const vals = Object.values(summary.byStatus).map((v) => v.amount || 0);
    return Math.max(1, ...vals);
  }, [summary]);

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Total (this page)
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ${summary.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Across {res?.items?.length || 0} payout(s)
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Breakdown by status
          </p>
          <div className="space-y-1.5">
            {PAYOUT_STATUSES.map((s) => {
              const data = summary.byStatus[s] || { amount: 0, count: 0 };
              const ratio = Math.max(
                0.06,
                Math.min(1, data.amount / maxBarAmount)
              );
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-0.5">
                    <span>{s}</span>
                    <span>
                      ${data.amount.toFixed(2)}{" "}
                      <span className="text-gray-400">
                        ({data.count || 0})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-1.5 rounded bg-indigo-500"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!res?.items?.length && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No payouts on this page.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Bulk actions
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Selected:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {selectedIds.length}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PAYOUT_STATUSES.map((s) => (
              <button
                key={s}
                disabled={!selectedIds.length || busyBulk}
                onClick={() => bulkUpdate(s)}
                className={`px-3 py-1.5 text-xs rounded-md border transition ${
                  selectedIds.length && !busyBulk
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70"
                }`}
              >
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
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
          res?.items?.map((po) => {
            const shortId = po?._id ? po._id.slice(-6) : "—";
            const checked = selectedIds.includes(po._id);
            return (
              <div
                key={po._id || Math.random().toString(36).slice(2)}
                className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) =>
                        handleSelectOne(po._id, e.target.checked)
                      }
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Payout • {shortId}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {po.createdAt
                          ? new Date(po.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${payoutStatusClass(
                      po.status || "unknown"
                    )}`}
                  >
                    {po.status || "unknown"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Amount:{" "}
                  <strong>
                    ${Number(po.amount || 0).toFixed(2)}{" "}
                    {po.currency || "USD"}
                  </strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Freelancer: {po.freelancer?.email || po.freelancerEmail || "—"}
                  {" • "}
                  Method: {po.method || po.provider || "—"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setDetail(po)}
                    className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    View details
                  </button>

                  {PAYOUT_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={busyId === po._id}
                      onClick={() => po._id && setStatusFn(po._id, s)}
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
            );
          })}

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
                onClick={() => load(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Icon.Refresh /> Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && (res?.pages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {res?.page || page} / {res?.pages || 1}
          </span>
          <button
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
            disabled={page >= (res?.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <Modal onClose={() => setDetail(null)} title="Payout details">
          <DetailRow label="ID" value={detail._id} />
          <DetailRow label="Status" value={detail.status || "unknown"} />
          <DetailRow
            label="Amount"
            value={`${Number(detail.amount || 0).toFixed(2)} ${
              detail.currency || "USD"
            }`}
          />
          <DetailRow
            label="Freelancer"
            value={detail.freelancer?.email || detail.freelancerEmail || "—"}
          />
          <DetailRow
            label="Method"
            value={detail.method || detail.provider || "—"}
          />
          <DetailRow
            label="Created at"
            value={
              detail.createdAt
                ? new Date(detail.createdAt).toLocaleString()
                : "—"
            }
          />
          <DetailRow
            label="Updated at"
            value={
              detail.updatedAt
                ? new Date(detail.updatedAt).toLocaleString()
                : "—"
            }
          />
        </Modal>
      )}
    </>
  );
}

/* ============================ Shared UI ============================ */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <Icon.Close />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-xs text-gray-900 dark:text-gray-100 break-all text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}
