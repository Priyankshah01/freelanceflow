// src/pages/Employers.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";
import { CheckCircle } from "lucide-react";

const EmployersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (!isAuthenticated) return navigate("/login");
    if (user.role === "client") return navigate("/client/post-job");
    return navigate("/client/dashboard");
  };

  return (
    <LandingLayout>
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hire vetted remote talent
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Product designers, UX researchers, frontend, backend, fullstack,
              mobile — ready to start in days, not weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Pre-vetted freelancers",
                desc: "Profiles with skills, rates, availability, and past work.",
              },
              {
                title: "Transparent pricing",
                desc: "Set budgets, pay milestones, control spends.",
              },
              {
                title: "Collaboration tools",
                desc: "Messaging, requirements, file store — all inside dashboard.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-lg p-6 border border-gray-100"
              >
                <CheckCircle className="w-8 h-8 text-indigo-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Post your first job in 2 minutes
              </h2>
              <p className="text-gray-600">
                Describe the work, set a budget, and start receiving proposals.
              </p>
            </div>
            <button
              onClick={handleCTA}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold"
            >
              Post a job
            </button>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default EmployersPage;
