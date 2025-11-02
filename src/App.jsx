// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";

// Freelancer pages
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile from "./pages/freelancer/Profile";
import FreelancerJobs from "./pages/freelancer/Jobs";
import FreelancerProposals from "./pages/freelancer/Proposals";
import FreelancerActiveProjects from "./pages/freelancer/Projects";

// Client pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientProfile from "./pages/client/Profile";
import PostJob from "./pages/client/PostJob";
import ClientProjects from "./pages/client/Projects";
import ProjectProposals from "./pages/client/ProjectProposals";
import ProposalDetail from "./pages/client/ProposalDetail";
import FindFreelancers from "./pages/client/FindFreelancer";
import FreelancerPublicProfile from "./pages/client/FreelancerPublicProfile";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminManageUser from "./pages/admin/ManageUser";
import AdminReports from "./pages/admin/Reports";
import AdminManageProject from "./pages/admin/ManageProject";
import AdminSettings from "./pages/admin/Settings";
import AdminRevenue from "./pages/admin/Revenue";

import "./styles/index.css";

/* -------- Admin guard (uses the same AuthContext) -------- */
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* old demo dashboard / public dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* AUTH’D SHARED ROUTES */}
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          }
        />

        {/* =============== FREELANCER ROUTES =============== */}
        <Route
          path="/freelancer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/profile"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/jobs"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/proposals"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/projects"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerActiveProjects />
            </ProtectedRoute>
          }
        />

        {/* ✅ BACKWARD-COMPAT FREELANCER ROUTES (your old /dashboard/freelancer/...) */}
        <Route
          path="/dashboard/freelancer"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/freelancer/profile"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/freelancer/projects"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerActiveProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/freelancer/proposals"
          element={
            <ProtectedRoute allowedRoles={["freelancer"]}>
              <FreelancerProposals />
            </ProtectedRoute>
          }
        />

        {/* =============== CLIENT ROUTES =============== */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/post-job"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/proposals"
          element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ProjectProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/proposals/:id"
          element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ProposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/projects"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/freelancers"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <FindFreelancers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/freelancers/:id"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <FreelancerPublicProfile />
            </ProtectedRoute>
          }
        />

        {/* ✅ BACKWARD-COMPAT CLIENT ROUTES (because your dashboard buttons used /dashboard/client/...) */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/profile"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/post-job"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/projects"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/proposals"
          element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ProjectProposals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/proposals/:id"
          element={
            <ProtectedRoute allowedRoles={["client", "admin"]}>
              <ProposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/freelancers"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <FindFreelancers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/freelancers/:id"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <FreelancerPublicProfile />
            </ProtectedRoute>
          }
        />

        {/* =============== ADMIN ROUTES =============== */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminManageUser />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAdmin>
              <AdminReports />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <RequireAdmin>
              <AdminManageProject />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireAdmin>
              <AdminSettings />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <RequireAdmin>
              <AdminRevenue />
            </RequireAdmin>
          }
        />

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
