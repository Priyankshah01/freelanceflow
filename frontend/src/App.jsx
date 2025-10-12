// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Auth/Login";
import JobDetail from "./pages/JobDetail";

// Freelancer pages
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile from "./pages/freelancer/Profile";
import FreelancerJobs from "./pages/freelancer/Jobs";
import FreelancerProposals from "./pages/freelancer/Proposals";
import FreelancerActiveProjects from "./pages/freelancer/projects";

// Client pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientProfile from "./pages/client/Profile";
import PostJob from "./pages/client/PostJob";
import ClientProjects from "./pages/client/Projects";
import ProjectProposals from "./pages/client/ProjectProposals";
import ProposalDetail from "./pages/client/ProposalDetail";
import FindFreelancers from "./pages/client/FindFreelancer";
import FreelancerPublicProfile from "./pages/client/FreelancerPublicProfile";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminManageUser from "./pages/admin/ManageUser";
import AdminReports from "./pages/admin/Reports";


// Styles
import "./styles/index.css";

/* -------- Admin guard (uses the same AuthContext) -------- */
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;          // ✅ <-- fixed path
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Shared (authenticated) */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />

          {/* Freelancer */}
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

          {/* Client */}
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

          {/* Admin */}
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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
