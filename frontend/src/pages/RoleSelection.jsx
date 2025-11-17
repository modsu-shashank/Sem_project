import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Settings, ShoppingBag, Shield, User } from "lucide-react";

const RoleSelection = () => {
  const { user, switchToAdminMode, switchToUserMode } = useAuth();
  const navigate = useNavigate();

  const handleAdminMode = () => {
    switchToAdminMode();
    navigate("/admin");
  };

  const handleUserMode = () => {
    switchToUserMode();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Welcome, {user.name}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose how you'd like to use the application
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin Panel Option */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              user.role === "admin"
                ? "border-orange-500 hover:border-orange-600"
                : "border-gray-200 hover:border-gray-300 opacity-50 cursor-not-allowed"
            }`}
            onClick={user.role === "admin" ? handleAdminMode : undefined}
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Admin Panel
              </h3>
              <p className="text-gray-600 mb-6">
                Manage products, view orders, and control the application
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Add and edit products
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  Manage inventory
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  View customer orders
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  System administration
                </li>
              </ul>
              {user.role === "admin" ? (
                <button className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  Enter Admin Panel
                </button>
              ) : (
                <div className="text-red-500 text-sm">
                  Admin access required
                </div>
              )}
            </div>
          </div>

          {/* User Mode Option */}
          <div
            className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={handleUserMode}
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Shopping Mode
              </h3>
              <p className="text-gray-600 mb-6">
                Browse products, make purchases, and manage your account
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <User className="h-4 w-4 text-green-500 mr-2" />
                  Browse products
                </li>
                <li className="flex items-center">
                  <User className="h-4 w-4 text-green-500 mr-2" />
                  Add items to cart
                </li>
                <li className="flex items-center">
                  <User className="h-4 w-4 text-green-500 mr-2" />
                  Write reviews
                </li>
                <li className="flex items-center">
                  <User className="h-4 w-4 text-green-500 mr-2" />
                  Manage watchlist
                </li>
              </ul>
              <button className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Start Shopping
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            You can switch between modes anytime from your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
