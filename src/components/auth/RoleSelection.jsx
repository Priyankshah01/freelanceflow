// src/components/auth/RoleSelection.jsx
import React from 'react';
import { User, Briefcase, Shield } from 'lucide-react';

const RoleSelection = ({ selectedRole, onRoleChange, error }) => {
  const roles = [
    {
      id: 'freelancer',
      name: 'Freelancer',
      description: 'I want to work on projects and offer my skills',
      icon: <User className="w-8 h-8" />,
      color: 'border-blue-500 bg-blue-50 text-blue-700'
    },
    {
      id: 'client',
      name: 'Client',
      description: 'I want to hire freelancers for my projects',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'border-green-500 bg-green-50 text-green-700'
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        I want to join as
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
              ${selectedRole === role.id 
                ? role.color 
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }
            `}
            onClick={() => onRoleChange(role.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-3 ${selectedRole === role.id ? '' : 'text-gray-400'}`}>
                {role.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{role.name}</h3>
              <p className="text-sm opacity-80">{role.description}</p>
            </div>
            
            {/* Radio button indicator */}
            <div className="absolute top-3 right-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedRole === role.id 
                  ? 'border-current bg-current' 
                  : 'border-gray-300'
                }
              `}>
                {selectedRole === role.id && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelection;