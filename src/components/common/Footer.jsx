// src/components/common/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-indigo-400">Freelance</span>Flow
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Hire and work with vetted remote talent. Built for modern teams.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-6">Resources</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/blog" className="hover:text-white">
                  Developer stories
                </Link>
              </li>
              <li>
                <Link to="/for-freelancers" className="hover:text-white">
                  Remote work
                </Link>
              </li>
              <li>
                <Link to="/blog/salary-guide" className="hover:text-white">
                  Salary guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/for-employers" className="hover:text-white">
                  Partnerships
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of use
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy policy
                </a>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-white">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Extra space / CTA */}
          <div>
            <h3 className="font-bold text-lg mb-4">Post a job</h3>
            <p className="text-gray-400 mb-4">
              Need a designer, developer, marketer or product person?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-sm font-medium"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} FreelanceFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
