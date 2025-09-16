// src/layouts/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-indigo-600">Freelance</span>Flow
          </div>
        </div>
        
        {/* Auth Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 FreelanceFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;