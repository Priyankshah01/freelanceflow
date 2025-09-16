// src/pages/client/Dashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Briefcase, Users, DollarSign, FileText } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Active Projects',
      value: '5',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Total Freelancers',
      value: '12',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Total Spent',
      value: '$8,450',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      label: 'Job Posts',
      value: '23',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const activeProjects = [
    {
      title: 'E-commerce Platform Development',
      freelancer: 'John Doe',
      progress: 75,
      deadline: '2024-10-15',
      budget: '$2,500'
    },
    {
      title: 'Brand Logo Design',
      freelancer: 'Sarah Wilson',
      progress: 90,
      deadline: '2024-10-12',
      budget: '$450'
    },
    {
      title: 'Mobile App Backend',
      freelancer: 'Mike Johnson',
      progress: 45,
      deadline: '2024-10-30',
      budget: '$1,800'
    }
  ];

  const recentActivity = [
    {
      action: 'New proposal received',
      project: 'Website Redesign',
      freelancer: 'Alex Chen',
      time: '2 hours ago'
    },
    {
      action: 'Project milestone completed',
      project: 'E-commerce Platform',
      freelancer: 'John Doe',
      time: '5 hours ago'
    },
    {
      action: 'Payment processed',
      project: 'Logo Design',
      freelancer: 'Sarah Wilson',
      time: '1 day ago'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your projects and collaborate with talented freelancers.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeProjects.map((project, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className="text-sm font-medium text-green-600">{project.budget}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Freelancer: {project.freelancer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Due: {project.deadline}</span>
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
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-4 border-indigo-400 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{activity.action}</h3>
                    <p className="text-sm text-gray-600">{activity.project}</p>
                    <p className="text-sm text-gray-500">{activity.freelancer}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                ))}
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
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Post New Job</h3>
                    <p className="text-sm text-gray-600">Create a new project listing</p>
                  </div>
                </div>
              </button>
              
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Find Freelancers</h3>
                    <p className="text-sm text-gray-600">Browse talented professionals</p>
                  </div>
                </div>
              </button>
              
              <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-indigo-600 mr-3" />
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