// src/components/landing/SpecializationSection.jsx
import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import Button from '../common/Button';

const SpecializationSection = () => {
  const services = [
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Recruitment",
      description: "Ready Buy law country she suitable her bad taste. Your case our was not being sir Among are we there law built now. In built table in rapid blush. Merits behind on afraid or warmly.",
      link: "Read More"
    },
    {
      icon: <UserCheck className="w-8 h-8 text-indigo-600" />,
      title: "Outstaffing", 
      description: "Ready Buy law country she suitable her bad taste. Your case our was not being sir Among are we there law built now. In built table in rapid blush. Merits behind on afraid or warmly.",
      link: "Read More"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-lg mb-2">What we Do?</p>
          <h2 className="text-4xl font-bold text-gray-900">Our Specialization</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {services.map((service, index) => (
            <div key={index} className="text-center group">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                  {service.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
                {service.description}
              </p>
              
              <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                {service.link} →
              </a>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="primary" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecializationSection;