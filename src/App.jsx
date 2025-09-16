// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';

// Dashboard pages
import FreelancerDashboard from './pages/freelancer/Dashboard';
import ClientDashboard from './pages/client/Dashboard';
// import AdminDashboard from './pages/admin/Dashboard'; // TODO: Create admin dashboard

// Styles
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Freelancer Routes */}
            <Route 
              path="/freelancer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Client Routes */}
            <Route 
              path="/client/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - TODO: Implement admin dashboard */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Admin dashboard coming soon...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Placeholder routes for future implementation */}
            <Route 
              path="/freelancer/*" 
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Feature Coming Soon</h1>
                    <p className="mt-4">This freelancer feature is under development.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/client/*" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Feature Coming Soon</h1>
                    <p className="mt-4">This client feature is under development.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Feature Coming Soon</h1>
                    <p className="mt-4">This admin feature is under development.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;