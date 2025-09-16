// src/components/landing/HeroSection.jsx
import React from 'react';
import Button from '../common/Button';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 px-4 min-h-screen flex flex-col sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col flex-grow justify-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            We Make{' '}
            <span className="text-indigo-600 relative">
              Hiring Easy
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-200 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Hire top talent, thoroughly VETTED remote software engineers across the globe. We help supply build strong and diverse teams.
          </p>
          
          <div className="mb-16 space-x-4 flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg" className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
              Hire Developers
            </Button>
            <Button variant="secondary" size="lg" className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
              Find Freelance work
            </Button>
          </div>
        </div>

        {/* Trust Indicators - Fixed at bottom */}
        <div className="mt-auto pt-12">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            <div className="text-xl md:text-2xl font-bold text-gray-400">asana</div>
            <div className="text-xl md:text-2xl font-bold text-gray-400">MoneyAfrica</div>
            <div className="text-xl md:text-2xl font-bold text-gray-400">quidax</div>
            <div className="text-xl md:text-2xl font-bold text-gray-400">Walmart</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;