// src/pages/freelancer/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Briefcase,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  AlertTriangle,
  LogIn,
} from 'lucide-react';

/* ================== API helper ================== */
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:5000';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
};

/* ================== utils ================== */
const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(amount) || 0
  );

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusPillColor = (status) => {
  switch (status) {
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'open':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/* ================== component ================== */
const FreelancerDashboard = () => {
  const { user } = useAuth(); // might be null on first paint
  const navigate = useNavigate();

  // we’ll compute against this, which can come from context OR /auth/me
  const [effectiveUser, setEffectiveUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pendingProposals, setPendingProposals] = useState([]);
  const [acceptedProposals, setAcceptedProposals] = useState([]);
  const [rejectedProposals, setRejectedProposals] = useState([]);

  // If context has user later, sync it
  useEffect(() => {
    if (user && user._id) setEffectiveUser(user);
  }, [user]);

  const activeProjects = useMemo(() => {
    const list = (acceptedProposals || [])
      .map((p) => p.project)
      .filter(Boolean)
      .filter(
        (proj, i, arr) =>
          arr.findIndex((x) => String(x?._id || x?.id) === String(proj?._id || proj?.id)) === i
      );

    const inProgress = list.filter((p) => p?.status === 'in-progress');
    return inProgress.length ? inProgress : list;
  }, [acceptedProposals]);

  const completedProjects = useMemo(
    () => activeProjects.filter((p) => p?.status === 'completed'),
    [activeProjects]
  );

  const stats = useMemo(() => {
    return {
      activeProjects: activeProjects.length,
      totalEarnings: effectiveUser?.earnings?.total || 0,
      hoursWorked: effectiveUser?.work?.hours || 0,
      averageRating: effectiveUser?.ratings?.average || 0,
      completedProjects: completedProjects.length,
      pendingProposals: pendingProposals.length,
    };
  }, [activeProjects, completedProjects.length, pendingProposals.length, effectiveUser]);

  const recentProjects = useMemo(() => {
    const rows = (acceptedProposals || [])
      .map((p) => ({
        id: String(p.project?._id || p.project?.id || p._id),
        title: p.project?.title || 'Untitled Project',
        client: p.project?.client?.name || 'Client',
        status: p.project?.status || 'in-progress',
        deadline:
          p.project?.timeline?.endDate || p.project?.timeline?.dueDate || p.project?.updatedAt || p.updatedAt,
        progress: Number(p.project?.workCompleted ?? 0),
        budget:
          p.project?.budget?.type === 'fixed'
            ? (p.project?.budget?.amount || 0)
            : (p.project?.budget?.hourlyRate?.max || p.project?.budget?.hourlyRate?.min || 0),
        budgetType: p.project?.budget?.type || 'fixed',
      }))
      .slice(0, 5);

    return rows;
  }, [acceptedProposals]);

  const load = async () => {
    setLoading(true);
    setErr('');

    try {
      // 1) Ensure we have a user
      let u = user && user._id ? user : null;

      if (!u) {
        const token = localStorage.getItem('token');
        if (!token) {
          setErr('You are not logged in. Please log in to view your dashboard.');
          setLoading(false);
          return;
        }
        // try to recover from server
        try {
          const me = await api('/auth/me');
          u = me?.data?.user || null;
          if (u) setEffectiveUser(u);
        } catch {
          setErr('Session expired or user not found. Please log in again.');
          setLoading(false);
          return;
        }
      }

      // 2) Load proposals (role-aware on backend; as freelancer, this returns only mine)
      const [pend, acc, rej] = await Promise.all([
        api('/proposals?status=pending&limit=100'),
        api('/proposals?status=accepted&limit=100'),
        api('/proposals?status=rejected&limit=100'),
      ]);

      setPendingProposals(pend?.data?.proposals || []);
      setAcceptedProposals(acc?.data?.proposals || []);
      setRejectedProposals(rej?.data?.proposals || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setErr(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and whenever the context user id changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const u = effectiveUser;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Error Banner */}
        {err && (
          <div className="mb-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-700 flex items-start justify-between">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
              <div>
                <div className="font-medium">We couldn’t load everything</div>
                <div className="text-sm opacity-90">{err}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="ml-4 inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Log in
            </button>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {u?.name ? `Welcome back, ${u.name}! 👋` : 'Welcome 👋'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Member since {formatDate(u?.createdAt)}</span>
            {u?.profile?.location && (
              <>
                <span>•</span>
                <span>📍 {u.profile.location}</span>
              </>
            )}
            {u?.profile?.availability && (
              <>
                <span>•</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    u.profile.availability === 'available'
                      ? 'bg-green-100 text-green-800'
                      : u.profile.availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.profile.availability.charAt(0).toUpperCase() +
                    u.profile.availability.slice(1)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Active Projects',
              value: stats.activeProjects,
              icon: <Briefcase className="w-6 h-6" />,
              color: 'text-blue-600 bg-blue-100',
              change: `${stats.completedProjects} completed`,
            },
            {
              label: 'Total Earnings',
              value: formatCurrency(stats.totalEarnings),
              icon: <DollarSign className="w-6 h-6" />,
              color: 'text-green-600 bg-green-100',
              change: 'Based on payouts',
            },
            {
              label: 'Avg. Rating',
              value:
                stats.averageRating > 0
                  ? `${Number(stats.averageRating).toFixed(1)} ⭐`
                  : 'No ratings yet',
              icon: <Star className="w-6 h-6" />,
              color: 'text-yellow-600 bg-yellow-100',
              change: `${u?.ratings?.count || 0} reviews`,
            },
            {
              label: 'Hours Worked',
              value: stats.hoursWorked,
              icon: <Clock className="w-6 h-6" />,
              color: 'text-orange-600 bg-orange-100',
              change: 'Tracked time',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Overview</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    {u?.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-semibold text-lg">
                        {u?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{u?.name || 'Freelancer'}</h3>
                    <p className="text-sm text-gray-600">{u?.email || ''}</p>
                  </div>
                </div>

                {u?.profile?.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{u.profile.bio}</p>
                  </div>
                )}

                {!!(u?.profile?.skills?.length) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {u.profile.skills.slice(0, 6).map((skill, i) => (
                        <span
                          key={`${skill}-${i}`}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {u.profile.skills.length > 6 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{u.profile.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {u?.profile?.hourlyRate && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hourly Rate</h4>
                    <p className="text-lg font-semibold text-green-600">
                      ${u.profile.hourlyRate}/hour
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Link to="/freelancer/profile">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors">
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusPillColor(
                            project.status
                          )}`}
                        >
                          {project.status?.replace('-', ' ') || 'in progress'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Client: {project.client}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {formatDate(project.deadline)}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {project.budgetType === 'fixed'
                              ? formatCurrency(project.budget)
                              : `${formatCurrency(project.budget)}/hr`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, project.progress))}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.min(100, Math.max(0, project.progress))}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No active projects</h3>
                  <p className="text-gray-600 mb-4">Browse available jobs to find your next project.</p>
                  <button
                    onClick={() => navigate('/freelancer/jobs')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/freelancer/proposals')}
            className="w-full bg-white border border-gray-200 rounded-md p-4 text-left hover:shadow-sm"
          >
            <div className="text-sm text-gray-500">Proposals</div>
            <div className="text-lg font-semibold text-gray-900">
              Pending: {pendingProposals.length}
            </div>
          </button>
          <button
            onClick={() => navigate('/freelancer/projects')}
            className="w-full bg-white border border-gray-200 rounded-md p-4 text-left hover:shadow-sm"
          >
            <div className="text-sm text-gray-500">Projects</div>
            <div className="text-lg font-semibold text-gray-900">
              Active: {activeProjects.length}
            </div>
          </button>
          <button
            onClick={() => navigate('/freelancer/earnings')}
            className="w-full bg-white border border-gray-200 rounded-md p-4 text-left hover:shadow-sm"
          >
            <div className="text-sm text-gray-500">Earnings</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats.totalEarnings)}
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
