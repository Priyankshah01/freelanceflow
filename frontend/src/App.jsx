// src/App.jsx - Updated with Client Proposal Management
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import JobDetail from './pages/JobDetail';
import FreelancerProposals from './pages/freelancer/Proposals';
import FreelancerActiveProjects from './pages/freelancer/projects';


// Dashboard pages
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerProfile from './pages/freelancer/Profile';
import FreelancerJobs from './pages/freelancer/Jobs';

import ClientDashboard from './pages/client/Dashboard';
import ClientProfile from './pages/client/Profile';
import PostJob from './pages/client/PostJob';
import ClientProjects from './pages/client/Projects';
// import ProjectProposals from './pages/client/ManageJob';
import ProjectProposals from './pages/client/ProjectProposals';
import ProposalDetail from './pages/client/ProposalDetail';

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

            {/* Job Detail Route - Accessible to all authenticated users */}
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />

            {/* Freelancer Routes */}
            <Route
              path="/freelancer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/profile"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/jobs"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/proposals"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerProposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/projects"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <FreelancerActiveProjects />
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
            <Route
              path="/client/profile"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/post-job"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            {/* NEW: Client Proposal Management */}
            <Route
              path="/client/proposals"
              element={
                <ProtectedRoute allowedRoles={['client', 'admin']}>
                  <ProjectProposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/proposals/:id"
              element={
                <ProtectedRoute allowedRoles={['client', 'admin']}>
                  <ProposalDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/client/projects"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjects /> {/* replace with the component above */}
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Admin features coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for future features */}
            <Route
              path="/freelancer/proposals"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">My Proposals</h1>
                    <p className="mt-4">Proposal management feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/freelancer/projects"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">My Projects</h1>
                    <p className="mt-4">Project management feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/freelancer/earnings"
              element={
                <ProtectedRoute allowedRoles={['freelancer']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Earnings</h1>
                    <p className="mt-4">Earnings tracking feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/manage-jobs"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Manage Jobs</h1>
                    <p className="mt-4">Job management feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/projects"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">My Projects</h1>
                    <p className="mt-4">Project management feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/freelancers"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Find Freelancers</h1>
                    <p className="mt-4">Freelancer discovery feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/payments"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Payments</h1>
                    <p className="mt-4">Payment management feature coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
