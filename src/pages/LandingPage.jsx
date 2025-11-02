// src/pages/LandingPage.jsx
import React from "react";
import LandingLayout from "../layouts/LandingLayout";
import HeroSection from "../components/landing/HeroSection";
import SpecializationSection from "../components/landing/SpecializationSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";

const LandingPage = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <SpecializationSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </LandingLayout>
  );
};

export default LandingPage;
