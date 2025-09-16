// src/components/auth/SignupForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../common/FormField';
import RoleSelection from './RoleSelection';
import Button from '../common/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

const SignupForm = ({ onToggleMode, onSuccess }) => {
  const { signup, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const user = await signup(formData);
      onSuccess?.(user);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Signup failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join FreelanceFlow and start your journey</p>
      </div>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{authError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          error={errors.email}
          required
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          error={errors.password}
          required
          showPasswordToggle
        />

        <FormField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
        />

        <RoleSelection
          selectedRole={formData.role}
          onRoleChange={handleRoleChange}
          error={errors.role}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;