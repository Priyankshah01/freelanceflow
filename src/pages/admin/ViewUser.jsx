// src/pages/admin/ViewUser.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserById } from "../../services/adminApi";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
    } catch (error) {
      setErr("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">Loading user details…</div>
    );
  }

  if (err) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">{err}</div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">
        User not found.
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          User Details
        </h1>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/40"
        >
          ← Back
        </button>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {user.name}
        </h2>

        <div className="space-y-3 text-gray-700 dark:text-gray-300">

          <p><b>Email:</b> {user.email}</p>

          <p>
            <b>Role:</b>{" "}
            <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white">
              {user.role}
            </span>
          </p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={`px-2 py-1 rounded ${
                user.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-white"
              }`}
            >
              {user.status}
            </span>
          </p>

          <p>
            <b>Created At:</b> {new Date(user.createdAt).toLocaleString()}
          </p>

          {user.updatedAt && (
            <p>
              <b>Updated At:</b> {new Date(user.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-6">
          <Link
            to="/admin/users"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Users
          </Link>
        </div>
      </div>
    </div>
  );
}
