// src/components/landing/HeroSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
          We Make Hiring Easy
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Hire top remote{" "}
          <span className="text-indigo-600 underline decoration-indigo-300">
            product & engineering
          </span>{" "}
          talent.
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Hire vetted freelancers or find your next remote gig. Built for
          startups, agencies, and modern distributed teams.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/for-employers")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-semibold shadow-sm transition-colors w-full sm:w-auto"
          >
            Hire Developers
          </button>
          <button
            onClick={() => navigate("/for-freelancers")}
            className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-md font-semibold transition-colors w-full sm:w-auto"
          >
            Find freelance work
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
