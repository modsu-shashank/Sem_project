import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, validatePassword } from "../context/AuthContext.jsx";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [formData, setFormData] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordValidation.isValid) {
      setError("Please fix password requirements");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!formData.consent) {
      setError("You must consent to receive SMS and updates");
      return;
    }
    try {
      await register({
        username: formData.firstName + " " + formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
      });
      // navigate("/user-dashboard");
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-8 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Create{" "}
          <span className="text-gradient bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            account
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <input
              name="dob"
              type="date"
              placeholder="DOB"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-500"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          {passwordValidation.errors.length > 0 && (
            <ul className="text-xs text-red-500 pl-4 list-disc">
              {passwordValidation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
              required
            />
            <label className="text-xs text-gray-500">
              I consent to receive SMS messages regarding my treatment plan, as
              well as updates regarding RGO's products and services (message and
              data rates may apply)
            </label>
          </div>
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
            Sign Up
            <span className="ml-2">→</span>
          </button>
        </form>
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
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
