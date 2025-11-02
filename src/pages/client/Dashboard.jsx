// src/pages/client/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Briefcase,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Building,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 👇 shared API (decides Vite env → backend → localhost)
import apiService from '../../services/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeProjects: 0,
      totalFreelancers: 0,
      totalSpent: 0,
      jobPosts: 0,
      pendingProposals: 0,
      completedProjects: 0,
    },
    recentActivity: [],
    activeProjects: [],
  });

  const load = async () => {
    try {
      // ensure user; self-heal if missing
      let u = user;
      if (!u) {
        const me = await apiService.request('/auth/me');
        u = me?.data?.user || me?.user || null;
        if (!u) throw new Error('User not found. Please re-login.');
      }

      // Replace the sections below with real endpoints when ready:
      // const myProjects = await apiService.request('/projects?ownedByMe=true'); // all
      // const active = await apiService.request('/projects?ownedByMe=true&status=in-progress');
      // const completed = await apiService.request('/projects?ownedByMe=true&status=completed');
      // const proposalsPending = await apiService.request('/proposals?status=pending'); // role-aware: client gets proposals to their projects
      // const freelancersWorkedWith = await apiService.request('/users/worked-with?scope=my-projects');

      const stats = {
        activeProjects: 0, // active?.data?.projects?.length || 0,
        totalFreelancers: 0, // freelancersWorkedWith?.data?.count || 0,
        totalSpent: 0, // compute from payments when you add them
        jobPosts: 0, // myProjects?.data?.projects?.length || 0,
        pendingProposals: 0, // proposalsPending?.data?.proposals?.length || 0,
        completedProjects: 0, // completed?.data?.projects?.length || 0
      };

      const recentActivity = []; // fill from activity/logs when available
      const activeProjects = []; // active?.data?.projects || [];

      setDashboardData({ stats, recentActivity, activeProjects });
    } catch (e) {
      setMessage(e.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number(amount) || 0
    );

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statsCards = [
    {
      label: 'Active Projects',
      value: dashboardData.stats.activeProjects,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100',
      change: '',
    },
    {
      label: 'Total Freelancers',
      value: dashboardData.stats.totalFreelancers,
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100',
      change: '',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(dashboardData.stats.totalSpent),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-100',
      change: '',
    },
    {
      label: 'Job Posts',
      value: dashboardData.stats.jobPosts,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-100',
      change: '',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {message && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
            {message}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Client'}! 👋
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {user?.createdAt && <span>Member since {formatDate(user.createdAt)}</span>}
            {user?.profile?.company && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {user.profile.company}
                </span>
              </>
            )}
            {user?.profile?.website && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <a
                    href={user.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Website
                  </a>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change ? <p className="text-xs text-gray-500">{stat.change}</p> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Profile */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      <Building className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.profile?.company || user?.name || 'Company'}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>

                {user?.profile?.industry && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Industry</h4>
                    <p className="text-sm text-gray-600">{user.profile.industry}</p>
                  </div>
                )}

                {user?.profile?.companySize && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company Size</h4>
                    <p className="text-sm text-gray-600">{user.profile.companySize} employees</p>
                  </div>
                )}

                {user?.profile?.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-sm text-gray-600">{user.profile.location}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  {/* this was already clickable — keeping it */}
                  <Link to="/dashboard/client/profile">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors">
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
            </div>
            <div className="p-6">
              {dashboardData.activeProjects.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.activeProjects.map((project) => (
                    <div
                      key={project._id || project.id}
                      className="border border-gray-100 rounded-lg p-4 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Freelancer:{' '}
                        {project.assignedFreelancer?.name ||
                          project.freelancer?.name ||
                          '—'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {project.timeline?.endDate && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {formatDate(project.timeline.endDate)}
                            </span>
                          )}
                          {project.budget && (
                            <span className="text-sm text-green-600 font-medium">
                              {project.budget.type === 'fixed'
                                ? formatCurrency(project.budget.amount)
                                : `${formatCurrency(
                                    project.budget.hourlyRate?.min
                                  )}-${formatCurrency(
                                    project.budget.hourlyRate?.max || 0
                                  )}/hr`}
                            </span>
                          )}
                        </div>
                        {typeof project.progress === 'number' && (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {project.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No active projects</h3>
                  <p className="text-gray-600 mb-4">
                    Start by posting your first job to find talented freelancers!
                  </p>
                  <Link to="/dashboard/client/post-job">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors">
                      Post a Job
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.project}</p>
                        <p className="text-sm text-gray-500">{activity.freelancer}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600">Your project activities will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
