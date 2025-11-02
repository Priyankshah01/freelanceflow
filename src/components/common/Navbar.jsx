// src/components/common/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "./Button";

const navLinkClass =
  "text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors";

const activeClass =
  "text-gray-900 border-b-2 border-indigo-500 pb-1.5 -mb-1.5";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!isAuthenticated) return navigate("/login");
    switch (user.role) {
      case "freelancer":
        return navigate("/freelancer/dashboard");
      case "client":
        return navigate("/client/dashboard");
      case "admin":
        return navigate("/admin/dashboard");
      default:
        return navigate("/");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
          >
            <span className="text-indigo-600">Freelance</span>Flow
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavLink
              to="/for-employers"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${activeClass}` : navLinkClass
              }
            >
              For Employers
            </NavLink>
            <NavLink
              to="/for-freelancers"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${activeClass}` : navLinkClass
              }
            >
              For Freelancers
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${activeClass}` : navLinkClass
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? `${navLinkClass} ${activeClass}` : navLinkClass
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToDashboard}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-medium">
                      {user.name || "Account"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </button>
                <Button variant="ghost" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Sign in
                </Button>
                <Button variant="primary" onClick={() => navigate("/login")}>
                  Sign up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((p) => !p)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <NavLink
              to="/for-employers"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2 text-base font-medium"
            >
              For Employers
            </NavLink>
            <NavLink
              to="/for-freelancers"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2 text-base font-medium"
            >
              For Freelancers
            </NavLink>
            <NavLink
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2 text-base font-medium"
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2 text-base font-medium"
            >
              Contact
            </NavLink>

            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      goToDashboard();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium w-full text-left"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        Go to {user.role} dashboard
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
