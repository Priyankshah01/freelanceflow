// src/pages/admin/ManageUser.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../services/adminApi";

const Icon = {
  Users: () => <span>👥</span>,
  Search: () => <span>🔎</span>,
  Back: () => <span>↩</span>,
  Delete: () => <span>🗑️</span>,
};

export default function ManageUser() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await listUsers({ q, role, status, page, limit: 20 });
      setRes(data);
    } catch (e) {
      setErr(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const onFilter = async (e) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const changeRole = async (id, r) => {
    setBusyId(id);
    try {
      await updateUserRole(id, r);
      await load();
    } finally {
      setBusyId("");
    }
  };

  const changeStatus = async (id, s) => {
    setBusyId(id);
    try {
      await updateUserStatus(id, s);
      await load();
    } finally {
      setBusyId("");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setBusyId(id);
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    } finally {
      setBusyId("");
    }
  };

  const statusChip = useMemo(
    () => ({
      active:
        "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-800",
      suspended:
        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800",
    }),
    []
  );

  return (
    <div className="w-full mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Page head */}
      <div className="flex items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
            <Icon.Users />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Manage Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              / Users
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

      {/* Filter toolbar */}
      <form
        onSubmit={onFilter}
        className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Icon.Search />
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              placeholder="Search name or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>

          <select
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Errors */}
      {err && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {err}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
              <tr className="text-left">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {!loading &&
                res?.items?.map((u) => (
                  <tr key={u._id} className="text-gray-800 dark:text-gray-100">
                    <Td className="font-medium">{u.name}</Td>
                    <Td>{u.email}</Td>

                    <Td>
                      <select
                        className="px-2 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        value={u.role}
                        disabled={busyId === u._id}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                      >
                        <option value="admin">admin</option>
                        <option value="client">client</option>
                        <option value="freelancer">freelancer</option>
                      </select>
                    </Td>

                    <Td>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.status === "active"
                            ? statusChip.active
                            : statusChip.suspended
                        }`}
                      >
                        {u.status}
                      </span>
                    </Td>

                    <Td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </Td>

                    {/* ACTIONS COLUMN */}
                    <Td className="space-x-2">
                      {/* VIEW BUTTON */}
                      <button
                        className="px-3 py-1.5 text-xs rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                      >
                        View
                      </button>

                      {/* ACTIVATE / SUSPEND */}
                      {u.status === "active" ? (
                        <button
                          className="px-3 py-1.5 text-xs rounded-md bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                          disabled={busyId === u._id}
                          onClick={() => changeStatus(u._id, "suspended")}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1.5 text-xs rounded-md bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
                          disabled={busyId === u._id}
                          onClick={() => changeStatus(u._id, "active")}
                        >
                          Activate
                        </button>
                      )}

                      {/* DELETE BUTTON */}
                      <button
                        className="px-3 py-1.5 text-xs rounded-md border border-red-400 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                        disabled={busyId === u._id}
                        onClick={() => removeUser(u._id)}
                      >
                        <Icon.Delete /> Delete
                      </button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && res?.pages > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Showing page{" "}
              <b className="text-gray-700 dark:text-gray-200">{res.page}</b> of{" "}
              <b className="text-gray-700 dark:text-gray-200">{res.pages}</b>
            </span>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
                disabled={page >= res.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
