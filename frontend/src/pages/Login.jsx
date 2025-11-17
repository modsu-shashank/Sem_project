import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Try login with email first, fallback to phone if email fails
      await login(formData.identifier, formData.password);
      // Redirect based on role or just to dashboard
      // navigate("/user-dashboard");
    } catch (error) {
      setError(error.message || "Invalid email/phone or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Log in to your{" "}
          <span className="text-gradient bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            account
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="identifier"
            type="text"
            placeholder="Email or Phone Number"
            value={formData.identifier}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold py-3 rounded-lg shadow hover:from-green-500 hover:to-blue-500 transition-colors text-lg mt-2"
            disabled={loading}
          >
            Log In
            <span className="ml-2">→</span>
          </button>
        </form>
        <div className="flex justify-end mt-2">
          <Link to="#" className="text-blue-500 hover:underline text-sm">
            Forgot password?
          </Link>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700"
          disabled
        >
          <FcGoogle className="text-2xl" />
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
