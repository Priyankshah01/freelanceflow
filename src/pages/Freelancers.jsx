// src/pages/public/Freelancers.jsx
import React from "react";
import LandingLayout from "../../layouts/LandingLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Briefcase, Star, Shield } from "lucide-react";

const FreelancersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (!isAuthenticated) return navigate("/login");
    if (user.role === "freelancer") return navigate("/freelancer/jobs");
    return navigate("/freelancer/dashboard");
  };

  return (
    <LandingLayout>
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find high-quality remote gigs
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse jobs from trusted employers. Apply once, track proposals,
              chat with clients — all inside FreelanceFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
              <Briefcase className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Curated jobs
              </h3>
              <p className="text-sm text-gray-600">
                Latest roles from startups, agencies, and product teams.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
              <Star className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Build reputation
              </h3>
              <p className="text-sm text-gray-600">
                Ratings and reviews help you win more work.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
              <Shield className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Safe workflow
              </h3>
              <p className="text-sm text-gray-600">
                Requirements, files, and project status in one place.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCTA}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-md font-semibold"
            >
              Browse open jobs
            </button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default FreelancersPage;
