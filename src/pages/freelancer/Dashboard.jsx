// src/pages/freelancer/Dashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Briefcase, DollarSign, Clock, Star, User } from 'lucide-react';

const FreelancerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Active Projects',
      value: '3',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Total Earnings',
      value: '$2,450',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Hours Worked',
      value: '127',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      label: 'Rating',
      value: '4.9',
      icon: <Star className="w-6 h-6" />,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  const recentProjects = [
    {
      title: 'E-commerce Website Development',
      client: 'TechCorp Inc.',
      status: 'In Progress',
      deadline: '2024-10-15',
      progress: 75
    },
    {
      title: 'Mobile App UI Design',
      client: 'StartupXYZ',
      status: 'Review',
      deadline: '2024-10-20',
      progress: 90
    },
    {
      title: 'Database Optimization',
      client: 'DataSystems Ltd',
      status: 'Planning',
      deadline: '2024-10-25',
      progress: 25
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
            Here's what's happening with your freelance work today.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProjects.map((project, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.client}</p>
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-indigo-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Browse New Jobs</h3>
                      <p className="text-sm text-gray-600">Find your next project opportunity</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-indigo-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Update Profile</h3>
                      <p className="text-sm text-gray-600">Keep your skills and portfolio current</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-indigo-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">View Earnings</h3>
                      <p className="text-sm text-gray-600">Track your income and payments</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;