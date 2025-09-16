// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  User, 
  FileText, 
  Search,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import Button from '../components/common/Button';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isFreelancer, isClient, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${user.role}/dashboard`, icon: Home }
    ];

    if (isFreelancer) {
      return [
        ...baseItems,
        { name: 'Browse Jobs', href: '/freelancer/jobs', icon: Search },
        { name: 'My Proposals', href: '/freelancer/proposals', icon: FileText },
        { name: 'Active Projects', href: '/freelancer/projects', icon: Briefcase },
        { name: 'Profile', href: '/freelancer/profile', icon: User },
        { name: 'Earnings', href: '/freelancer/earnings', icon: DollarSign }
      ];
    }

    if (isClient) {
      return [
        ...baseItems,
        { name: 'Post Job', href: '/client/post-job', icon: FileText },
        { name: 'Manage Jobs', href: '/client/manage-jobs', icon: Briefcase },
        { name: 'Active Projects', href: '/client/projects', icon: Briefcase },
        { name: 'Find Freelancers', href: '/client/freelancers', icon: Users },
        { name: 'Payments', href: '/client/payments', icon: DollarSign }
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        { name: 'Manage Users', href: '/admin/users', icon: Users },
        { name: 'Monitor Projects', href: '/admin/projects', icon: Briefcase },
        { name: 'Handle Disputes', href: '/admin/disputes', icon: FileText },
        { name: 'Reports', href: '/admin/reports', icon: Settings }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isCurrentPage = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white shadow-lg">
          {/* Logo */}
          <div className="flex items-center px-6 pb-4 border-b border-gray-200">
            <div className="text-xl font-bold text-gray-900">
              <span className="text-indigo-600">Freelance</span>Flow
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${current
                      ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* User profile section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-200">
              <div className="text-xl font-bold text-gray-900">
                <span className="text-indigo-600">Freelance</span>Flow
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 flex-1 px-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const current = isCurrentPage(item.href);
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${current
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="text-lg font-bold text-gray-900">
              <span className="text-indigo-600">Freelance</span>Flow
            </div>
            
            <button className="text-gray-500 hover:text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;