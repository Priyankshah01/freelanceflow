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
  AlertTriangle,
  LogIn,
} from 'lucide-react';

// 👇 use shared API (this already picks Render vs localhost)
import { get } from '../../services/api';

/* ================== utils ================== */
const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [effectiveUser, setEffectiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pendingProposals, setPendingProposals] = useState([]);
  const [acceptedProposals, setAcceptedProposals] = useState([]);
  const [rejectedProposals, setRejectedProposals] = useState([]);

  // Sync context user
  useEffect(() => {
    const uid = user?._id || user?.id;
    if (uid) setEffectiveUser(user);
  }, [user]);

  const activeProjects = useMemo(() => {
    const list = (acceptedProposals || [])
      .map((p) => p.project)
      .filter(Boolean)
      .filter(
        (proj, i, arr) =>
          arr.findIndex(
            (x) => String(x?._id || x?.id) === String(proj?._id || proj?.id)
          ) === i
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
  }, [
    activeProjects,
    completedProjects.length,
    pendingProposals.length,
    effectiveUser,
  ]);

  const recentProjects = useMemo(() => {
    return (acceptedProposals || [])
      .map((p) => ({
        id: String(
          p.project?._id || p.project?.id || p._id // fallback
        ),
        title: p.project?.title || 'Untitled Project',
        client: p.project?.client?.name || 'Client',
        status: p.project?.status || 'in-progress',
        deadline:
          p.project?.timeline?.endDate ||
          p.project?.timeline?.dueDate ||
          p.project?.updatedAt ||
          p.updatedAt,
        budget:
          p.project?.budget?.type === 'fixed'
            ? p.project?.budget?.amount || 0
            : p.project?.budget?.hourlyRate?.max ||
              p.project?.budget?.hourlyRate?.min ||
              0,
        budgetType: p.project?.budget?.type || 'fixed',
      }))
      .slice(0, 5);
  }, [acceptedProposals]);

  const load = async () => {
    setLoading(true);
    setErr('');

    try {
      let u = user && (user._id || user.id) ? user : null;

      // recover user if page refreshed
      if (!u) {
        const me = await get('/auth/me');
        u = me?.data?.user || me?.user || null;
        if (u) setEffectiveUser(u);
      }

      if (!u) {
        setErr('You are not logged in. Please log in to view your dashboard.');
        setLoading(false);
        return;
      }

      // fetch proposals in parallel (all through Render now)
      const [pend, acc, rej] = await Promise.all([
        get('/proposals?status=pending&limit=100'),
        get('/proposals?status=accepted&limit=100'),
        get('/proposals?status=rejected&limit=100'),
      ]);

      setPendingProposals(pend?.data?.proposals || pend?.proposals || []);
      setAcceptedProposals(acc?.data?.proposals || acc?.proposals || []);
      setRejectedProposals(rej?.data?.proposals || rej?.proposals || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setErr(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id]);

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
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Projects
          </h2>
          {recentProjects.length ? (
            <div className="space-y-4">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col">
                    {/* 👇 keep route same as before; change it later if your router uses /jobs/:id */}
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-sm text-gray-500">{p.client}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusPillColor(
                        p.status
                      )}`}
                    >
                      {p.status.replace('-', ' ')}
                    </span>
                    <p className="text-sm text-gray-500">
                      {formatDate(p.deadline)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {p.budgetType === 'fixed'
                        ? formatCurrency(p.budget)
                        : `$${p.budget}/hr`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent projects.</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/proposals"
            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-6 flex flex-col items-center justify-center"
          >
            <Briefcase className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="font-medium text-gray-900">View Proposals</p>
            <p className="text-sm text-gray-500">
              {pendingProposals.length} pending
            </p>
          </Link>
          <Link
            to="/projects"
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-6 flex flex-col items-center justify-center"
          >
            <DollarSign className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">My Projects</p>
            <p className="text-sm text-gray-500">
              {activeProjects.length} active
            </p>
          </Link>
          <Link
            to="/profile"
            className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-6 flex flex-col items-center justify-center"
          >
            <Star className="w-8 h-8 text-yellow-600 mb-2" />
            <p className="font-medium text-gray-900">Profile</p>
            <p className="text-sm text-gray-500">Update your info</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
