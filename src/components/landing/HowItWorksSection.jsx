// src/components/landing/HowItWorksSection.jsx
import React from 'react';
import { FileText, Eye, UserPlus } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FileText className="w-8 h-8" />,
      category: "EQUITY ENGAGEMENT",
      title: "Application",
      description: "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut vitae rutrum est. Ut vitae rutrum est."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      category: "INTEGRATED APPROACH",
      title: "Review",
      description: "We will review your requirements and present you a list of shortlisted candidates based on your needs."
    },
    {
      icon: <UserPlus className="w-8 h-8" />,
      category: "GROWTH ORIENTED",
      title: "Placement",
      description: "We move forward to place the best fit as per your preference and immediately begin onboarding"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Build Your Team Now
            </h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              How It Works
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              It is really as simple as the following steps.
            </p>
          </div>

          {/* Right Side - Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:shadow-md transition-shadow">
                    {step.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-xs font-bold text-orange-500 tracking-wider mb-2">
                    {step.category}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;