// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import SignupForm from '../../components/auth/SignupForm';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      // Redirect based on user role
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
    }
  }, [user, navigate]);

  const handleAuthSuccess = (user) => {
    // Navigation is handled by the useEffect above
    console.log('Authentication successful:', user);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <AuthLayout>
      {isLoginMode ? (
        <LoginForm
          onToggleMode={toggleMode}
          onSuccess={handleAuthSuccess}
        />
      ) : (
        <SignupForm
          onToggleMode={toggleMode}
          onSuccess={handleAuthSuccess}
        />
      )}
    </AuthLayout>
  );
};

export default Login;