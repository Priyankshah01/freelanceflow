// src/pages/admin/ViewUser.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { deleteUser, getUser } from "../../services/adminApi";

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
      const data = await getUser(id);
      setUser(data);
    } catch (e) {
      setErr(e.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      navigate("/admin/users");
    } catch (e) {
      alert(e.message || "Failed to delete user");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        Loading user…
      </div>
    );

  if (err)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {err}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <Link
        to="/admin/users"
        className="text-sm text-indigo-600 dark:text-indigo-400"
      >
        ← Back to Users
      </Link>

      <h1 className="text-2xl font-semibold mt-4 text-gray-900 dark:text-white">
        User Details
      </h1>

      <div className="mt-6 space-y-4 bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <Detail label="Name" value={user.name} />
        <Detail label="Email" value={user.email} />
        <Detail label="Role" value={user.role} />
        <Detail label="Status" value={user.status} />
        <Detail
          label="Created At"
          value={new Date(user.createdAt).toLocaleString()}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
        >
          Delete User
        </button>

        <button
          onClick={() => navigate(`/admin/users`)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {value || "—"}
      </p>
    </div>
  );
}
