// src/pages/admin/Settings.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminSettings,
  updateAdminSettings,
  getSystemHealth,
} from "../../services/adminApi";

const Icon = {
  Settings: () => <span>⚙️</span>,
  Save: () => <span>💾</span>,
  Back: () => <span>↩</span>,
  Check: () => <span>✅</span>,
  Cross: () => <span>❌</span>,
};

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    siteName: "FreelanceFlow",
    supportEmail: "support@example.com",
    allowSignup: true,
    enablePayouts: false,
    maintenanceMode: false,
    force2FA: false,
    sessionTimeoutMin: 60,
  });

  const [health, setHealth] = useState({
    status: "unknown",
    node: "",
    uptimeSec: 0,
    mongo: "unknown",
  });

  const load = async () => {
    try {
      setErr("");
      setOk("");
      setLoading(true);
      const [settings, sys] = await Promise.all([
        getAdminSettings(),
        getSystemHealth(),
      ]);
      if (settings) {
        setForm((f) => ({
          ...f,
          ...settings,
          // fallback so we never send undefined to backend
          sessionTimeoutMin:
            typeof settings.sessionTimeoutMin === "number"
              ? settings.sessionTimeoutMin
              : f.sessionTimeoutMin,
        }));
      }
      if (sys) setHealth(sys);
    } catch (e) {
      setErr(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: val,
    }));

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      setOk("");
      setSaving(true);
      // normalize number field
      const payload = {
        ...form,
        sessionTimeoutMin: Math.max(
          5,
          Number.isFinite(Number(form.sessionTimeoutMin))
            ? Number(form.sessionTimeoutMin)
            : 60
        ),
      };
      await updateAdminSettings(payload);
      setOk("Settings updated successfully.");
    } catch (e) {
      setErr(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-full bg-white dark:bg-gray-900 min-h-screen mx-auto p-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
            <Icon.Settings />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Admin Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400">
                Admin
              </Link>{" "}
              / Settings
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

      {/* Alerts */}
      {err && (
        <div className="mb-6 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {err}
        </div>
      )}
      {ok && (
        <div className="mb-6 p-3 rounded-lg border border-green-300 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
          {ok}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              {Array.from({ length: 5 }).map((__, j) => (
                <div
                  key={j}
                  className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <form
          onSubmit={onSave}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* General */}
          <section className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              General
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Site name
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={form.siteName}
                  onChange={(e) => onChange("siteName", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Support email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={form.supportEmail}
                  onChange={(e) => onChange("supportEmail", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Features
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Allow user signup"
                checked={form.allowSignup}
                onChange={(v) => onChange("allowSignup", v)}
              />
              <Toggle
                label="Enable payouts"
                checked={form.enablePayouts}
                onChange={(v) => onChange("enablePayouts", v)}
              />
              <Toggle
                label="Maintenance mode"
                checked={form.maintenanceMode}
                onChange={(v) => onChange("maintenanceMode", v)}
              />
            </div>
          </section>

          {/* Security / System */}
          <section className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm backdrop-blur-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Security & System
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Require 2FA for admins"
                checked={form.force2FA}
                onChange={(v) => onChange("force2FA", v)}
              />

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Session timeout (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={form.sessionTimeoutMin}
                  onChange={(e) =>
                    onChange(
                      "sessionTimeoutMin",
                      e.target.value === ""
                        ? ""
                        : Math.max(5, parseInt(e.target.value || "0", 10))
                    )
                  }
                />
              </div>

              {/* Health */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  System Health
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <Row label="Status">
                    {health.status === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Icon.Check /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Icon.Cross /> Degraded
                      </span>
                    )}
                  </Row>
                  <Row label="Node">
                    <code className="text-xs">{health.node || "—"}</code>
                  </Row>
                  <Row label="Uptime">
                    {health.uptimeSec
                      ? `${Math.floor(health.uptimeSec)} s`
                      : "—"}
                  </Row>
                  <Row label="MongoDB">{health.mongo}</Row>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="lg:col-span-3 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
            >
              <Icon.Save /> {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100">{children}</span>
    </div>
  );
}
