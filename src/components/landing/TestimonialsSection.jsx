// src/components/landing/TestimonialsSection.jsx
import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ava Thompson",
    role: "Founder, PixelForge Studio",
    content:
      "We posted a UI revamp task and got 4 strong proposals in 24 hours. The built-in messaging made it super easy to finalize scope.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=facearea&facepad=3&h=200&q=80",
  },
  {
    name: "Daniel Lee",
    role: "Product Manager, FinEdge",
    content:
      "FreelanceFlow helped us find a React/Node freelancer who actually understood product. Delivery was on time and on budget.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=facearea&facepad=3&h=200&q=80",
  },
  {
    name: "Maria Gomez",
    role: "Marketing Lead, NovaHealth",
    content:
      "I liked that I could see past work and reviews before hiring. The platform felt trustworthy and the talent was genuinely good.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&auto=format&fit=facearea&facepad=3&h=200&q=80",
  },
];

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={16}
      className={
        index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
      }
    />
  ));

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gray-500 font-medium mb-4 tracking-wide uppercase">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            Teams love FreelanceFlow
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Real feedback from companies and founders who hired through the
            platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-gray-100"
            >
              {/* Avatar + name */}
              <div className="mb-6 flex flex-col items-center">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover mb-4 shadow-sm"
                />
                <h4 className="font-bold text-gray-900 text-lg">
                  {item.name}
                </h4>
                <p className="text-gray-500 text-sm">{item.role}</p>
              </div>

              {/* Testimonial */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                “{item.content}”
              </blockquote>

              {/* Stars */}
              <div className="flex justify-center space-x-1">
                {renderStars(item.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
