import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items, totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const cartItemCount = totalItems || 0;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-green-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-gray-800 text-xl font-bold">
                RGO Organic Millets
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-800 hover:text-green-700 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-800 hover:text-green-700 transition-colors"
            >
              About us
            </Link>
            <Link
              to="/contact"
              className="text-gray-800 hover:text-green-700 transition-colors"
            >
              Contact us
            </Link>
            <Link
              to="/feedback"
              className="text-gray-800 hover:text-green-700 transition-colors"
            >
              Feedback
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link
                to="/watchlist"
                className="text-gray-800 hover:text-green-700 transition-colors"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            <Link
              to="/cart"
              className="text-gray-800 hover:text-green-700 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-gray-800 hover:text-green-700 transition-colors"
                >
                  <User className="h-5 w-5 mr-1" />
                  <span className="text-sm">{user.name}</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      user.role === "admin"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>

                    {user.role === "admin" ? (
                      <Link
                        to="/admin"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 block"
                      >
                        Admin Panel
                      </Link>
                    ) : null}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-green-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-green-50">
            <Link
              to="/"
              className="block text-gray-800 hover:text-green-700 transition-colors py-2 md:py-3"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-gray-800 hover:text-green-700 transition-colors py-2 md:py-3"
            >
              About us
            </Link>
            <Link
              to="/contact"
              className="block text-gray-800 hover:text-green-700 transition-colors py-2 md:py-3"
            >
              Contact us
            </Link>
            <Link
              to="/feedback"
              className="block text-gray-800 hover:text-green-700 transition-colors py-2 md:py-3"
            >
              Feedback
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
