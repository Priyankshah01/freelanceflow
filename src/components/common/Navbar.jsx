// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard
      switch (user.role) {
        case 'freelancer':
          navigate('/freelancer/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
            >
              <span className="text-indigo-600">Freelance</span>Flow
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                For Employers
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                For Freelancers
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Blog
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAuthAction}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                For Employers
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                For Freelancers
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                Blog
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium">
                Contact
              </a>
              
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleAuthAction}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium w-full text-left"
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span>{user.name} - Dashboard</span>
                    </button>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                      Sign in
                    </Button>
                    <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                      Sign up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;