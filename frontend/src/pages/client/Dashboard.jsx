// src/pages/client/Dashboard.jsx - REAL VERSION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Briefcase, Users, DollarSign, FileText, TrendingUp, Calendar, Building, Globe } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeProjects: 0,
      totalFreelancers: 0,
      totalSpent: 0,
      jobPosts: 0,
      pendingProposals: 0,
      completedProjects: 0
    },
    recentActivity: [],
    activeProjects: [],
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // For now, we'll use user data from the database
      // Later we'll add API calls for projects, proposals, etc.
      
      const stats = {
        activeProjects: 0, // TODO: Fetch from projects API
        totalFreelancers: 0, // TODO: Count unique freelancers worked with
        totalSpent: 0, // TODO: Sum of all project payments
        jobPosts: 0, // TODO: Count of posted jobs
        pendingProposals: 0, // TODO: Count of proposals waiting for review
        completedProjects: 0 // TODO: Count of completed projects
      };

      // Mock data - will be replaced with real API calls
      const recentActivity = [
        {
          id: 1,
          action: 'New proposal received',
          project: 'Website Redesign',
          freelancer: 'Sarah Designer',
          time: '2 hours ago',
          type: 'proposal'
        },
        {
          id: 2,
          action: 'Project milestone completed',
          project: 'E-commerce Platform',
          freelancer: 'John Developer',
          time: '5 hours ago',
          type: 'milestone'
        },
        {
          id: 3,
          action: 'Payment processed',
          project: 'Logo Design',
          freelancer: 'Mike Designer',
          time: '1 day ago',
          type: 'payment'
        }
      ];

      const activeProjects = [
        {
          id: 1,
          title: 'E-commerce Platform Development',
          freelancer: 'John Developer',
          progress: 75,
          deadline: '2024-12-15',
          budget: 2500,
          status: 'in-progress'
        },
        {
          id: 2,
          title: 'Brand Logo Design',
          freelancer: 'Sarah Designer',
          progress: 90,
          deadline: '2024-12-12',
          budget: 450,
          status: 'review'
        }
      ];

      setDashboardData({
        stats,
        recentActivity,
        activeProjects,
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      change: '+1 this month'
    },
    {
      label: 'Total Freelancers',
      value: dashboardData.stats.totalFreelancers,
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100',
      change: '3 active collaborations'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(dashboardData.stats.totalSpent),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-100',
      change: '+15% from last month'
    },
    {
      label: 'Job Posts',
      value: dashboardData.stats.jobPosts,
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-100',
      change: '2 pending proposals'
    }
  ];

  if (dashboardData.loading) {
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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Header with Real User Data */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Member since {formatDate(user?.createdAt)}</span>
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
                  <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
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
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
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
          {/* Company Profile Overview */}
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
                      {user?.profile?.company || user?.name}
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
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Active Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
              </div>
              <div className="p-6">
                {dashboardData.activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.activeProjects.map((project) => (
                      <div key={project.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Freelancer: {project.freelancer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {formatDate(project.deadline)}
                            </span>
                            <span className="text-sm text-green-600 font-medium">
                              {formatCurrency(project.budget)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{width: `${project.progress}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No active projects</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first job to find talented freelancers!</p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors">
                      Post a Job
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
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

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-indigo-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Post New Job</h3>
                    <p className="text-sm text-gray-600">Create a new project listing</p>
                  </div>
                </div>
              </button>
              
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-indigo-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Find Freelancers</h3>
                    <p className="text-sm text-gray-600">Browse talented professionals</p>
                  </div>
                </div>
              </button>
              
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-indigo-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-semibold text-gray-900">View Payments</h3>
                    <p className="text-sm text-gray-600">Track your project expenses</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;