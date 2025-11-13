// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState, isValidElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchOverview } from "../../services/adminApi";

// Simple emoji icons (swap with your own if you like)
const Icon = {
  Dashboard: () => <span>📊</span>,
  Users: () => <span>👥</span>,
  Projects: () => <span>📁</span>,
  Reports: () => <span>📋</span>,
  Settings: () => <span>⚙️</span>,
  Revenue: () => <span>💰</span>,
  Payouts: () => <span>💸</span>,
  Menu: () => <span>☰</span>,
  Close: () => <span>✕</span>,
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    fetchOverview()
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load overview"));
  }, []);

  // ✅ Must match your App.jsx routes
  const navigation = [
    { name: "Dashboard", to: "/admin", icon: Icon.Dashboard },
    { name: "Users", to: "/admin/users", icon: Icon.Users },
    { name: "Projects", to: "/admin/projects", icon: Icon.Projects },
    { name: "Reports", to: "/admin/reports", icon: Icon.Reports },
    { name: "Revenue", to: "/admin/revenue", icon: Icon.Revenue },
    { name: "Settings", to: "/admin/settings", icon: Icon.Settings },
  ];

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  if (err)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl max-w-2xl mx-auto mt-10">
          {err}
        </div>
      </div>
    );
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/admin/login");
  };
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg grid place-items-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Admin
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.to);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                  >
                    {ItemIcon ? <ItemIcon /> : null}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Icon.Menu />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, Admin
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>

              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full grid place-items-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50">
          {!data ? (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={data.counts?.users ?? 0}
                  trend="up"
                  icon={Icon.Users}
                  link="/admin/users"
                  linkText="View all"
                  color="blue"
                />
                <StatCard
                  title="Active Projects"
                  value={data.counts?.projects ?? 0}
                  trend="up"
                  icon={Icon.Projects}
                  link="/admin/reports"
                  linkText="Manage"
                  color="green"
                />
                <StatCard
                  title="Revenue"
                  value={`$${Number(
                    data.revenue?.find((x) => x._id === "paid")?.total || 0
                  ).toFixed(2)}`}
                  trend="up"
                  icon={Icon.Revenue}
                  color="purple"
                />
                <StatCard
                  title="Payouts"
                  value={`$${Number(
                    data.payouts?.find((x) => x._id === "sent")?.total || 0
                  ).toFixed(2)}`}
                  trend="down"
                  icon={Icon.Payouts}
                  color="orange"
                />
              </div>

              {/* Activity + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Project Activity (7 days)
                    </h2>
                    <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>

                  {data.trend7d?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2">
                        {data.trend7d.map((d) => (
                          <div key={d._id} className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {d._id}
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2">
                              <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                {d.count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Total projects this week:{" "}
                          {data.trend7d.reduce((sum, day) => sum + day.count, 0)}
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          ↑
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No recent project activity</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                    Quick Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Pending Reviews
                      </span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        {data.quick?.pendingReviews ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Active Sessions
                      </span>
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {data.quick?.activeSessions ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-sm text-orange-700 dark:text-orange-300">
                        Support Tickets
                      </span>
                      <span className="font-semibold text-orange-700 dark:text-orange-300">
                        {data.quick?.tickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        System Health
                      </span>
                      <span className="font-semibold text-purple-700 dark:text-purple-300">
                        {data.quick?.systemHealth ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon.Close />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg grid place-items-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                    Admin
                  </span>
                </div>
                <nav className="mt-8 px-4 space-y-2">
                  {navigation.map((item) => {
                    const active = isActive(item.to);
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.to}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {ItemIcon ? <ItemIcon /> : null}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- StatCard ----------
function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  link,
  linkText,
  color = "gray",
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      icon: "bg-blue-500",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-300",
      icon: "bg-green-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-300",
      icon: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      icon: "bg-orange-500",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-900/20",
      text: "text-gray-700 dark:text-gray-300",
      icon: "bg-gray-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "function") {
      const IconComp = icon;
      return <IconComp />;
    }
    if (isValidElement(icon)) return icon;
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <div
            className={`w-6 h-6 rounded grid place-items-center text-white ${colors.icon}`}
          >
            {renderIcon()}
          </div>
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${trend === "up"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
              }`}
          >
            {change}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{title}</p>

      {link && (
        <Link
          to={link}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
        >
          {linkText}
          <span className="ml-1">→</span>
        </Link>
      )}
    </div>
  );
}
