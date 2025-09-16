// src/components/landing/TestimonialsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sophia West",
      role: "Sales Manager",
      content: "Working with them booked the and experience in building real. We definitely they assistance fact necessary.",
      rating: 5
    },
    {
      name: "Sophia West", 
      role: "Sales Manager",
      content: "Working with them booked the and experience in building real. We definitely they assistance fact necessary.",
      rating: 5
    },
    {
      name: "Sophia West",
      role: "Sales Manager", 
      content: "Working with them booked the and experience in building real. We definitely they assistance fact necessary.",
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gray-500 font-medium mb-4">Testimonials</p>
          <h2 className="text-4xl font-bold text-gray-900">What Customers Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                <p className="text-gray-600 text-sm">{testimonial.role}</p>
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex justify-center space-x-1">
                {renderStars(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;