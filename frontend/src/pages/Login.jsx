import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta?.env?.VITE_GOOGLE_CLIENT_ID || "";
  const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, "");
  const [noAdmin, setNoAdmin] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    // Initialize Google Identity Services button if library loaded and client id provided
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            navigate("/");
          } catch (err) {
            setError(err.message || "Google sign-in failed");
          }
        },
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
        setGoogleReady(true);
      }
    } catch (e) {
      // ignore init errors, show fallback
    }
  }, [GOOGLE_CLIENT_ID, loginWithGoogle, navigate]);

  // Check if any admin exists to optionally show setup link
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/has-admin`);
        const data = await res.json();
        if (!aborted && res.ok) {
          setNoAdmin(!data?.data?.hasAdmin);
        }
      } catch {
        // ignore; don't show link on error
      }
    })();
    return () => { aborted = true; };
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Login and redirect to home
      await login(formData.email, formData.password);
      navigate("/");
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
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
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
        <div className="flex items-center justify-between mt-2">
          <Link to="#" className="text-blue-500 hover:underline text-sm">Forgot password?</Link>
          <Link to="/admin-login" className="text-blue-500 hover:underline text-sm">Admin login</Link>
        </div>
        {noAdmin && (
          <div className="mt-2 text-center">
            <Link to="/setup-admin" className="text-xs text-gray-400 hover:text-blue-500 underline">Setup admin</Link>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Login;
