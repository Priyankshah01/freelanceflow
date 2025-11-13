// src/pages/admin/ViewUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../services/adminApi";

const Icon = {
  Back: () => <span>↩</span>,
  Delete: () => <span>🗑️</span>,
  User: () => <span>👤</span>,
};

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await getUserDetails(id);
      setUser(data);
    } catch (e) {
      setErr(e.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (role) => {
    setBusy(true);
    try {
      await updateUserRole(id, role);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      await updateUserStatus(id, status);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setBusy(true);
    try {
      await deleteUser(id);
      navigate("/admin/users");
    } catch (err) {
      alert(err.message || "Failed to delete user");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-300 dark:text-gray-400">Loading user...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-red-500 text-lg">
        Failed to load user. {err && <p>{err}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white grid place-items-center">
            <Icon.User />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              /{" "}
              <Link
                to="/admin/users"
                className="text-indigo-600 dark:text-indigo-400"
              >
                Users
              </Link>{" "}
              / {user.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Icon.Back /> Back
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={user.name} />
            <Field label="Email" value={user.email} />
            <Field label="Role" value={user.role} />
            <Field label="Status" value={user.status} />
            <Field
              label="Joined"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "—"
              }
            />
            <Field
              label="Last Updated"
              value={
                user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "—"
              }
            />
          </div>
        </div>

        {/* Role Controls */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Role Controls
          </h2>

          <select
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            disabled={busy}
            value={user.role}
            onChange={(e) => changeRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        {/* Status Controls */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Status Controls
          </h2>

          {user.status === "active" ? (
            <button
              className="px-4 py-2 rounded-md bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-600/30"
              disabled={busy}
              onClick={() => changeStatus("suspended")}
            >
              Suspend User
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-md bg-green-600/20 text-green-700 dark:text-green-300 hover:bg-green-600/30"
              disabled={busy}
              onClick={() => changeStatus("active")}
            >
              Activate User
            </button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h2>

          <button
            onClick={removeUser}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
          >
            <Icon.Delete /> Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helper Component */
function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-gray-900 dark:text-gray-200 font-medium">
        {value || "—"}
      </div>
    </div>
  );
}
