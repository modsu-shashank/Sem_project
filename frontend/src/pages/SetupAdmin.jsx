import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SetupAdmin = () => {
  const [form, setForm] = useState({
    setupKey: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5001/api").replace(/\/$/, "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!form.username || !form.password) {
        throw new Error("Username and password are required.");
      }
      const res = await fetch(`${API_BASE_URL}/auth/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create admin");
      }
      setSuccess("Admin created successfully. You can now log in as admin.");
      setTimeout(() => navigate("/admin-login", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Setup Admin</h2>
        <p className="text-center text-gray-500 mb-6">One-time setup to create the first admin user.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="setupKey" type="password" placeholder="Setup Key" value={form.setupKey} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
          <input name="username" type="text" placeholder="Admin Username" value={form.username} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
          {success && <div className="text-green-700 text-sm text-center bg-green-50 p-2 rounded-lg">{success}</div>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold py-3 rounded-lg shadow hover:from-green-500 hover:to-blue-500 transition-colors text-lg mt-2">
            {loading ? "Submitting..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupAdmin;
