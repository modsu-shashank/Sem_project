import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, loading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, "");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/has-admin`);
        const data = await res.json();
        if (aborted) return;
        if (res.ok && data?.data?.hasAdmin) {
          setChecked(true);
        } else {
          navigate("/setup-admin", { replace: true });
        }
      } catch {
        navigate("/setup-admin", { replace: true });
      }
    })();
    return () => { aborted = true; };
  }, [API_BASE_URL, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      // Check latest user from localStorage (updated by AuthContext on login)
      let nextUser = null;
      try {
        nextUser = JSON.parse(localStorage.getItem("rgo_user") || "null");
      } catch {}
      if (nextUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        setError("This account is not an admin. Use the user login or sign in with an admin account.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Admin Login</h2>
        <p className="text-center text-gray-500 mb-6">
          Not an admin? <Link to="/login" className="text-blue-500 hover:underline font-medium">User login</Link>
        </p>
        {!checked ? (
          <div className="text-center text-gray-500">Checking access…</div>
        ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="text"
            placeholder="Admin Username or Email"
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
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold py-3 rounded-lg shadow hover:from-green-500 hover:to-blue-500 transition-colors text-lg mt-2"
            disabled={loading || submitting}
          >
            Log In
            <span className="ml-2">→</span>
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
